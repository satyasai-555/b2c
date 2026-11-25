package org.welhire.b2c.cv.internal.web.dto;

import org.welhire.b2c.cv.internal.ai.dto.CvParsingResponse;

import java.time.Instant;
import java.util.UUID;

public record CompleteCvUploadResponse(
        UUID cvId,
        String uploadStatus,
        String parsingStatus,
        Instant uploadedAt,
        CvParsingResponse parsedData
) {
}