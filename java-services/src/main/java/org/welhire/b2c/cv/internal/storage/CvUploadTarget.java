package org.welhire.b2c.cv.internal.storage;

import java.time.Instant;
import java.util.Map;

public record CvUploadTarget(
        String objectKey,
        String url,
        Instant expiresAt,
        Map<String, String> requiredHeaders
) {
    public CvUploadTarget {
        requiredHeaders = Map.copyOf(requiredHeaders);
    }

    @Override
    public String toString() {
        return "CvUploadTarget[url=REDACTED, expiresAt="
                + expiresAt + "]";
    }
}