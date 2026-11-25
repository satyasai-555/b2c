package org.welhire.b2c.cv.internal.web.dto;

import java.time.Instant;
import java.util.UUID;

public record CvUploadStatusResponse(
        UUID cvId,
        String uploadStatus,
        String parsingStatus,
        String failureCode,
        Instant uploadedAt,
        Instant completedAt
) {
}