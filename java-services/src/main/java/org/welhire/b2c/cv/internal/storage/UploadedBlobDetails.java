package org.welhire.b2c.cv.internal.storage;

public record UploadedBlobDetails(
        long sizeBytes,
        String versionId
) {
}