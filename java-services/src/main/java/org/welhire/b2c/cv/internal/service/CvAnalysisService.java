package org.welhire.b2c.cv.internal.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.welhire.b2c.cv.exceptions.CvAnalysisException;
import org.welhire.b2c.cv.exceptions.CvUploadException;
import org.welhire.b2c.cv.internal.ai.client.CvAnalysisClient;
import org.welhire.b2c.cv.internal.ai.dto.CvAnalysisRequest;
import org.welhire.b2c.cv.internal.document.CvAnalysisDocument;
import org.welhire.b2c.cv.internal.domain.CvParsingStatus;
import org.welhire.b2c.cv.internal.repository.CvAnalysisRepository;
import org.welhire.b2c.cv.internal.repository.CvGoalsRepository;
import org.welhire.b2c.cv.internal.repository.CvUploadRepository;
import org.welhire.b2c.guest.GuestAccess;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
public class CvAnalysisService {

    private final GuestAccess guestAccess;
    private final CvUploadRepository uploadRepository;
    private final CvGoalsRepository goalsRepository;
    private final CvAnalysisRepository analysisRepository;
    private final ObjectProvider<CvAnalysisClient> clientProvider;
    private final TransactionTemplate transactionTemplate;

    public CvAnalysisService(
            GuestAccess guestAccess,
            CvUploadRepository uploadRepository,
            CvGoalsRepository goalsRepository,
            CvAnalysisRepository analysisRepository,
            ObjectProvider<CvAnalysisClient> clientProvider,
            PlatformTransactionManager transactionManager
    ) {
        this.guestAccess = guestAccess;
        this.uploadRepository = uploadRepository;
        this.goalsRepository = goalsRepository;
        this.analysisRepository = analysisRepository;
        this.clientProvider = clientProvider;
        this.transactionTemplate =
                new TransactionTemplate(transactionManager);
    }

    // Suspend any caller transaction. Only the explicit blocks below
    // should hold a PostgreSQL transaction.
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public CvAnalysisDocument analyze(
            UUID cvId,
            HttpServletRequest servletRequest
    ) {
        Objects.requireNonNull(cvId, "cvId is required");

        UUID guestId = guestAccess.requireActiveGuest(servletRequest);
        CvAnalysisClient client = clientProvider.getIfAvailable();

        Preparation preparation = Objects.requireNonNull(
                transactionTemplate.execute(transactionStatus -> {
                    var upload = uploadRepository
                            .findOwnedUploadForUpdate(cvId, guestId)
                            .orElseThrow(this::uploadNotFound);

                    switch (upload.getAnalysisStatus()) {
                        case SUCCEEDED -> {
                            return new Preparation(true, null);
                        }

                        case PROCESSING -> throw new CvUploadException(
                                HttpStatus.CONFLICT,
                                "CV_ANALYSIS_IN_PROGRESS",
                                "Analysis has already started for this CV."
                        );

                        case FAILED -> throw new CvUploadException(
                                HttpStatus.CONFLICT,
                                "CV_ANALYSIS_FAILED",
                                "Analysis failed for this CV. "
                                        + "Please upload a new CV."
                        );

                        case NOT_STARTED -> {
                            // Validate prerequisites below.
                        }
                    }

                    if (upload.getParsingStatus()
                            != CvParsingStatus.SUCCEEDED) {
                        throw new CvUploadException(
                                HttpStatus.CONFLICT,
                                "CV_PARSING_NOT_READY",
                                "CV parsing must complete before analysis."
                        );
                    }

                    var goals = goalsRepository.findById(cvId)
                            .orElseThrow(() -> new CvUploadException(
                                    HttpStatus.CONFLICT,
                                    "CV_GOALS_REQUIRED",
                                    "Save your goals before starting analysis."
                            ));

                    if (client == null) {
                        throw new CvUploadException(
                                HttpStatus.SERVICE_UNAVAILABLE,
                                "CV_ANALYSIS_UNAVAILABLE",
                                "CV analysis is currently unavailable."
                        );
                    }

                    var aiRequest = new CvAnalysisRequest(
                            cvId,
                            goals.getTargetRole(),
                            goals.getMinExperience(),
                            goals.getMaxExperience(),
                            goals.getPreferredLocation()
                    );

                    upload.startAnalysis(Instant.now());

                    return new Preparation(false, aiRequest);
                }),
                "Analysis preparation must return a result"
        );

        if (preparation.existingResult()) {
            return findSavedAnalysis(cvId, guestId);
        }

        final CvAnalysisDocument saved;

        try {
            CvAnalysisClient availableClient = Objects.requireNonNull(
                    client,
                    "Analysis client must be available after preparation"
            );

            CvAnalysisRequest aiRequest = Objects.requireNonNull(
                    preparation.request(),
                    "Analysis request must be available after preparation"
            );

            // AI and MongoDB operations run outside the PostgreSQL transaction.
            var response = availableClient.analyze(aiRequest);

            var document = CvAnalysisDocument.create(
                    cvId,
                    guestId,
                    aiRequest,
                    response,
                    Instant.now()
            );

            saved = analysisRepository.insert(document);

        } catch (RuntimeException exception) {
            String failureCode =
                    exception instanceof CvAnalysisException analysisException
                            ? "CV_ANALYSIS_"
                            + analysisException.getCode().name()
                            : "CV_ANALYSIS_EXECUTION_FAILED";

            try {
                recordOutcome(cvId, guestId, failureCode);
            } catch (RuntimeException statusException) {
                log.error(
                        "Could not persist analysis failure: "
                                + "cvId={}, exceptionType={}",
                        cvId,
                        statusException.getClass().getSimpleName()
                );
            }

            throw exception;
        }

        // Keep this outside the processing catch:
        // a PostgreSQL failure must not mark a saved report as failed.
        recordOutcome(cvId, guestId, null);

        log.info("CV analysis completed: cvId={}", cvId);

        return saved;
    }

    private CvAnalysisDocument findSavedAnalysis(
            UUID cvId,
            UUID guestId
    ) {
        return analysisRepository.findByCvIdAndGuestId(
                cvId.toString(),
                guestId.toString()
        ).orElseThrow(() -> new CvUploadException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "CV_ANALYSIS_RESULT_MISSING",
                "The saved analysis result is unavailable."
        ));
    }

    private void recordOutcome(
            UUID cvId,
            UUID guestId,
            String failureCode
    ) {
        transactionTemplate.executeWithoutResult(transactionStatus -> {
            var upload = uploadRepository
                    .findOwnedUploadForUpdate(cvId, guestId)
                    .orElseThrow(this::uploadNotFound);

            if (failureCode == null) {
                upload.markAnalysisSucceeded(Instant.now());
            } else {
                upload.markAnalysisFailed(failureCode, Instant.now());
            }
        });
    }

    private CvUploadException uploadNotFound() {
        return new CvUploadException(
                HttpStatus.NOT_FOUND,
                "CV_UPLOAD_NOT_FOUND",
                "CV upload was not found."
        );
    }

    private record Preparation(
            boolean existingResult,
            CvAnalysisRequest request
    ) {
    }
}