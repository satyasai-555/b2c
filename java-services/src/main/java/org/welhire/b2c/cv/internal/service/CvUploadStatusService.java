package org.welhire.b2c.cv.internal.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.welhire.b2c.cv.exceptions.CvUploadException;
import org.welhire.b2c.cv.internal.repository.CvUploadRepository;
import org.welhire.b2c.cv.internal.web.dto.CvUploadStatusResponse;
import org.welhire.b2c.guest.GuestAccess;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CvUploadStatusService {

    private final GuestAccess guestAccess;
    private final CvUploadRepository uploadRepository;

    public CvUploadStatusResponse getStatus(
            UUID cvId,
            HttpServletRequest request
    ) {
        UUID guestId = guestAccess.requireActiveGuest(request);

        var upload = uploadRepository.findByIdAndGuestId(cvId, guestId)
                .orElseThrow(() -> new CvUploadException(
                        HttpStatus.NOT_FOUND,
                        "CV_UPLOAD_NOT_FOUND",
                        "CV upload was not found."
                ));

        var response = new CvUploadStatusResponse(
                upload.getId(),
                upload.getCvUploadStatus().name(),
                upload.getParsingStatus().name(),
                upload.getParsingFailureCode(),
                upload.getUploadedAt(),
                upload.getParsingCompletedAt()
        );

        log.debug(
                "CV status retrieved: cvId={}, uploadStatus={}, parsingStatus={}",
                response.cvId(),
                response.uploadStatus(),
                response.parsingStatus()
        );

        return response;
    }
}