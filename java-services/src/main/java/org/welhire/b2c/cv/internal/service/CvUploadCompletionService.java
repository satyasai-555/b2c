package org.welhire.b2c.cv.internal.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.welhire.b2c.cv.exceptions.CvParsingException;
import org.welhire.b2c.cv.exceptions.CvUploadException;
import org.welhire.b2c.cv.internal.document.ParsedCvDocument;
import org.welhire.b2c.cv.internal.domain.CvParsingStatus;
import org.welhire.b2c.cv.internal.domain.CvUploadStatus;
import org.welhire.b2c.cv.internal.entity.CvUpload;
import org.welhire.b2c.cv.internal.repository.CvUploadRepository;
import org.welhire.b2c.cv.internal.repository.ParsedCvRepository;
import org.welhire.b2c.cv.internal.storage.AzureCvStorageService;
import org.welhire.b2c.cv.internal.storage.UploadedBlobDetails;
import org.welhire.b2c.cv.internal.web.dto.CompleteCvUploadResponse;
import org.welhire.b2c.guest.GuestAccess;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
public class CvUploadCompletionService {

    private final GuestAccess guestAccess;
    private final CvUploadRepository repository;
    private final AzureCvStorageService storageService;
    private final TransactionTemplate transactionTemplate;
    private final long maxFileBytes;
    private final ObjectProvider<CvParsingService> parsingServiceProvider;
    private final ParsedCvRepository parsedCvRepository;

    public CvUploadCompletionService(
            GuestAccess guestAccess,
            CvUploadRepository repository,
            AzureCvStorageService storageService,
            PlatformTransactionManager transactionManager,
            @Value("${app.cv.max-file-bytes}") long maxFileBytes,
            ObjectProvider<CvParsingService> parsingServiceProvider,
            ParsedCvRepository parsedCvRepository
    ) {
        if (maxFileBytes <= 0) {
            throw new IllegalArgumentException(
                    "Maximum CV file size must be positive."
            );
        }

        this.guestAccess = guestAccess;
        this.repository = repository;
        this.storageService = storageService;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.maxFileBytes = maxFileBytes;
        this.parsingServiceProvider = parsingServiceProvider;
        this.parsedCvRepository = parsedCvRepository;
    }

    public CompleteCvUploadResponse complete(
            UUID cvId,
            HttpServletRequest request
    ) {
        long startedAt = System.nanoTime();

        UUID guestId = guestAccess.requireActiveGuest(request);

        CvUpload upload = repository.findByIdAndGuestId(cvId, guestId)
                .orElseThrow(this::uploadNotFound);

        CvParsingService parsingService =
                parsingServiceProvider.getIfAvailable();

        final UploadedBlobDetails blob;

        if (upload.getCvUploadStatus() == CvUploadStatus.AWAITING_UPLOAD) {
            blob = storageService.getUploadedBlobDetails(
                    cvId,
                    upload.getObjectKey()
            );

            validateSize(upload, blob);

        } else if (upload.getCvUploadStatus() == CvUploadStatus.UPLOADED) {
            blob = null;

        } else {
            throw new CvUploadException(
                    HttpStatus.CONFLICT,
                    "INVALID_CV_UPLOAD_STATE",
                    "The CV upload cannot be completed in its current state."
            );
        }

        // Commit upload metadata before calling AI.
        CvUpload completedUpload = Objects.requireNonNull(
                transactionTemplate.execute(transactionStatus -> {
                    CvUpload current = repository
                            .findOwnedUploadForUpdate(cvId, guestId)
                            .orElseThrow(this::uploadNotFound);

                    if (current.getCvUploadStatus() == CvUploadStatus.AWAITING_UPLOAD) {
                        if (blob == null) {
                            throw new IllegalStateException(
                                    "Verified blob details are missing."
                            );
                        }

                        current.markUploaded(
                                blob.versionId(),
                                Instant.now()
                        );

                    } else if (current.getCvUploadStatus() != CvUploadStatus.UPLOADED) {
                        throw new CvUploadException(
                                HttpStatus.CONFLICT,
                                "INVALID_CV_UPLOAD_STATE",
                                "The CV upload cannot be completed in its current state."
                        );
                    }

                    switch (current.getParsingStatus()) {
                        case NOT_STARTED -> {
                            if (parsingService == null) {
                                throw new CvUploadException(
                                        HttpStatus.SERVICE_UNAVAILABLE,
                                        "CV_PARSING_UNAVAILABLE",
                                        "CV parsing is currently unavailable."
                                );
                            }

                            current.startParsing(Instant.now());
                        }

                        case PROCESSING -> throw new CvUploadException(
                                HttpStatus.CONFLICT,
                                "CV_PARSING_IN_PROGRESS",
                                "Parsing has already started for this CV."
                        );

                        case FAILED -> throw new CvUploadException(
                                HttpStatus.CONFLICT,
                                "CV_PARSING_FAILED",
                                "Parsing failed for this CV. Please upload a new CV."
                        );

                        case SUCCEEDED -> {
                            // Return the existing result without calling AI again.
                        }
                    }

                    return current;
                })
        );

        // This runs outside the PostgreSQL transaction.
        final ParsedCvDocument parsedCv;

        if (completedUpload.getParsingStatus() == CvParsingStatus.SUCCEEDED) {
            parsedCv = parsedCvRepository.findByCvIdAndGuestId(
                    cvId.toString(),
                    guestId.toString()
            ).orElseThrow(() -> new CvUploadException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "CV_PARSING_RESULT_MISSING",
                    "The saved parsing result is unavailable."
            ));

        } else {
            try {
                // AI and MongoDB work run outside the PostgreSQL transaction.
                CvParsingService availableParser = Objects.requireNonNull(
                        parsingService,
                        "Parsing service must be available after starting parsing."
                );

                parsedCv = availableParser.parseAndStore(cvId, guestId);

            } catch (RuntimeException exception) {
                String failureCode = exception instanceof CvParsingException parsing
                        ? "CV_PARSING_" + parsing.getCode().name()
                        : "CV_PARSING_EXECUTION_FAILED";

                try {
                    recordParsingOutcome(cvId, guestId, failureCode);
                } catch (RuntimeException statusException) {
                    log.error(
                            "Could not persist parsing failure: cvId={}, exceptionType={}",
                            cvId,
                            statusException.getClass().getSimpleName()
                    );
                }

                // Preserve the original processing error.
                throw exception;
            }

            // Deliberately outside the catch above:
            // a PostgreSQL update failure must not mark a saved result as failed.
            recordParsingOutcome(cvId, guestId, null);
        }

        log.info(
                "CV upload and parsing completed: guestId={}, cvId={}, durationMs={}",
                guestId,
                cvId,
                (System.nanoTime() - startedAt) / 1_000_000
        );

        return new CompleteCvUploadResponse(
                completedUpload.getId(),
                completedUpload.getCvUploadStatus().name(),
                CvParsingStatus.SUCCEEDED.name(),
                completedUpload.getUploadedAt(),
                parsedCv.getParsedData()
        );
    }

    private void validateSize(
            CvUpload upload,
            UploadedBlobDetails blob
    ) {
        if (blob.sizeBytes() <= 0) {
            throw new CvUploadException(
                    HttpStatus.UNPROCESSABLE_CONTENT,
                    "EMPTY_CV_FILE",
                    "The uploaded CV file is empty."
            );
        }

        if (blob.sizeBytes() > maxFileBytes) {
            throw new CvUploadException(
                    HttpStatus.CONTENT_TOO_LARGE,
                    "CV_FILE_TOO_LARGE",
                    "The uploaded CV exceeds the allowed file size."
            );
        }

        if (blob.sizeBytes() != upload.getExpectedSizeBytes()) {
            log.warn(
                    "CV upload size mismatch: cvId={}, expectedBytes={}, actualBytes={}",
                    upload.getId(),
                    upload.getExpectedSizeBytes(),
                    blob.sizeBytes()
            );

            throw new CvUploadException(
                    HttpStatus.UNPROCESSABLE_CONTENT,
                    "CV_FILE_SIZE_MISMATCH",
                    "The uploaded file size does not match the selected file."
            );
        }
    }

    private CvUploadException uploadNotFound() {
        // Same response for a missing CV and a CV owned by another guest.
        return new CvUploadException(
                HttpStatus.NOT_FOUND,
                "CV_UPLOAD_NOT_FOUND",
                "CV upload was not found."
        );
    }

    private void recordParsingOutcome(
            UUID cvId,
            UUID guestId,
            String failureCode
    ) {
        transactionTemplate.executeWithoutResult(transactionStatus -> {
            CvUpload current = repository
                    .findOwnedUploadForUpdate(cvId, guestId)
                    .orElseThrow(this::uploadNotFound);

            if (failureCode == null) {
                current.markParsingSucceeded(Instant.now());
            } else {
                current.markParsingFailed(failureCode, Instant.now());
            }
        });
    }
}