package org.welhire.b2c.cv.internal.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.welhire.b2c.cv.exceptions.CvUploadException;
import org.welhire.b2c.cv.internal.repository.CvAnalysisRepository;
import org.welhire.b2c.cv.internal.repository.CvUploadRepository;
import org.welhire.b2c.cv.internal.web.dto.CvAnalysisPreviewResponse;
import org.welhire.b2c.cv.internal.web.mapper.CvAnalysisPreviewMapper;
import org.welhire.b2c.guest.GuestAccess;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CvAnalysisPreviewService {

    private final GuestAccess guestAccess;
    private final CvUploadRepository uploadRepository;
    private final CvAnalysisRepository analysisRepository;
    private final CvAnalysisService analysisService;
    private final CvAnalysisPreviewMapper previewMapper;

    public CvAnalysisPreviewResponse analyze(
            UUID cvId,
            HttpServletRequest request
    ) {
        // Analysis service verifies ownership and handles duplicate requests.
        var document = analysisService.analyze(cvId, request);

        // Only the preview DTO is returned to the controller.
        return previewMapper.toResponse(document);
    }

    public CvAnalysisPreviewResponse getPreview(
            UUID cvId,
            HttpServletRequest request
    ) {
        UUID guestId = guestAccess.requireActiveGuest(request);

        var upload = uploadRepository
                .findByIdAndGuestId(cvId, guestId)
                .orElseThrow(() -> new CvUploadException(
                        HttpStatus.NOT_FOUND,
                        "CV_UPLOAD_NOT_FOUND",
                        "CV upload was not found."
                ));

        switch (upload.getAnalysisStatus()) {
            case NOT_STARTED -> throw new CvUploadException(
                    HttpStatus.CONFLICT,
                    "CV_ANALYSIS_NOT_STARTED",
                    "CV analysis has not started."
            );

            case PROCESSING -> throw new CvUploadException(
                    HttpStatus.CONFLICT,
                    "CV_ANALYSIS_IN_PROGRESS",
                    "CV analysis is still in progress."
            );

            case FAILED -> throw new CvUploadException(
                    HttpStatus.CONFLICT,
                    "CV_ANALYSIS_FAILED",
                    "Analysis failed for this CV. Please upload a new CV."
            );

            case SUCCEEDED -> {
                // Read the saved report below.
            }
        }

        var document = analysisRepository
                .findByCvIdAndGuestId(
                        cvId.toString(),
                        guestId.toString()
                )
                .orElseThrow(() -> new CvUploadException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "CV_ANALYSIS_RESULT_MISSING",
                        "The saved analysis result is unavailable."
                ));

        return previewMapper.toResponse(document);
    }
}