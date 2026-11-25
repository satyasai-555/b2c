package org.welhire.b2c.cv.internal.ai.dto;

import org.springframework.core.io.Resource;

import java.util.Objects;
import java.util.UUID;

public record CvParsingRequest(
        Resource file,
        String fileName,
        String contentType
) {
    public CvParsingRequest {
        Objects.requireNonNull(file, "file is required");

        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("fileName is required");
        }

        if (contentType == null || contentType.isBlank()) {
            throw new IllegalArgumentException("contentType is required");
        }
    }
}