package org.welhire.b2c.cv.internal.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.welhire.b2c.cv.exceptions.CvUploadException;
import org.welhire.b2c.cv.internal.domain.CvAnalysisStatus;
import org.welhire.b2c.cv.internal.domain.CvParsingStatus;
import org.welhire.b2c.cv.internal.entity.CvGoals;
import org.welhire.b2c.cv.internal.repository.CvGoalsRepository;
import org.welhire.b2c.cv.internal.repository.CvUploadRepository;
import org.welhire.b2c.cv.internal.repository.ParsedCvRepository;
import org.welhire.b2c.cv.internal.web.dto.CvGoalsResponse;
import org.welhire.b2c.cv.internal.web.dto.SaveCvGoalsRequest;
import org.welhire.b2c.guest.GuestAccess;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CvGoalsService {

    private final GuestAccess guestAccess;
    private final CvUploadRepository uploadRepository;
    private final CvGoalsRepository goalsRepository;
    private final ParsedCvRepository parsedCvRepository;

    @Transactional
    public CvGoalsResponse save(
            UUID cvId,
            SaveCvGoalsRequest request,
            HttpServletRequest servletRequest
    ) {
        UUID guestId = guestAccess.requireActiveGuest(servletRequest);

        // Verify ownership and serialize goals updates for this CV.
        var upload = uploadRepository
                .findOwnedUploadForUpdate(cvId, guestId)
                .orElseThrow(() -> new CvUploadException(
                        HttpStatus.NOT_FOUND,
                        "CV_UPLOAD_NOT_FOUND",
                        "CV upload was not found."
                ));

        if (upload.getAnalysisStatus() != CvAnalysisStatus.NOT_STARTED) {
            throw new CvUploadException(
                    HttpStatus.CONFLICT,
                    "CV_GOALS_LOCKED",
                    "Goals cannot be changed after CV analysis has started."
            );
        }

        if (upload.getParsingStatus() != CvParsingStatus.SUCCEEDED) {
            throw parsingNotReady();
        }

        boolean parsedResultExists = parsedCvRepository
                .findByCvIdAndGuestId(
                        cvId.toString(),
                        guestId.toString()
                )
                .isPresent();

        if (!parsedResultExists) {
            throw new CvUploadException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "CV_PARSING_RESULT_MISSING",
                    "The saved parsing result is unavailable."
            );
        }

        var goals = goalsRepository.findById(cvId)
                .orElseGet(() -> CvGoals.create(cvId));

        goals.update(
                request.targetRole(),
                request.minExperience(),
                request.maxExperience(),
                request.preferredLocation()
        );

        var saved = goalsRepository.save(goals);

        log.debug("CV goals prepared for persistence: cvId={}", cvId);

        return new CvGoalsResponse(
                saved.getCvId(),
                saved.getTargetRole(),
                saved.getMinExperience(),
                saved.getMaxExperience(),
                saved.getPreferredLocation(),
                saved.getUpdatedAt()
        );
    }

    private CvUploadException parsingNotReady() {
        return new CvUploadException(
                HttpStatus.CONFLICT,
                "CV_PARSING_NOT_READY",
                "CV parsing must complete before submitting your answers."
        );
    }
}