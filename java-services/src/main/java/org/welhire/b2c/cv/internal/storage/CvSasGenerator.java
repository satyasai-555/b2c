package org.welhire.b2c.cv.internal.storage;

import com.azure.storage.blob.BlobClient;
import java.time.OffsetDateTime;

public interface CvSasGenerator {

    String generate(
            BlobClient blobClient,
            OffsetDateTime startsAt,
            OffsetDateTime expiresAt
    );
}