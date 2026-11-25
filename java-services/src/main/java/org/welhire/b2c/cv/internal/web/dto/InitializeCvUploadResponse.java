package org.welhire.b2c.cv.internal.web.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record InitializeCvUploadResponse(
        UUID cvId,
        String status,
        UploadInstructions upload
) {

    public record UploadInstructions(
            String method,
            String url,
            Map<String, String> requiredHeaders,
            Instant expiresAt
    ) {
        @Override
        public String toString() {
            return "UploadInstructions[method=" + method
                    + ", url=REDACTED, expiresAt=" + expiresAt + "]";
        }
    }
}