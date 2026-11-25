package org.welhire.b2c.cv.internal.storage;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import com.azure.storage.common.sas.SasProtocol;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
@Profile("local")
public class AzuriteCvSasGenerator implements CvSasGenerator {

    @Override
    public String generate(
            BlobClient blobClient,
            OffsetDateTime startsAt,
            OffsetDateTime expiresAt
    ) {
        BlobSasPermission permissions =
                new BlobSasPermission()
                        .setCreatePermission(true);

        BlobServiceSasSignatureValues signature =
                new BlobServiceSasSignatureValues(
                        expiresAt,
                        permissions
                )
                        .setStartTime(startsAt)
                        .setProtocol(SasProtocol.HTTPS_HTTP);

        return blobClient.generateSas(signature);
    }
}