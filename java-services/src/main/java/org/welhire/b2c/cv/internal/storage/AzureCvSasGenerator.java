package org.welhire.b2c.cv.internal.storage;

import com.azure.core.util.Context;
import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.models.UserDelegationKey;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import com.azure.storage.common.sas.SasProtocol;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.OffsetDateTime;

@Component
@Profile("!local")
public class AzureCvSasGenerator implements CvSasGenerator {

    private final BlobServiceClient blobServiceClient;
    private final Duration operationTimeout;

    public AzureCvSasGenerator(
            @Qualifier("cvBlobServiceClient")
            BlobServiceClient blobServiceClient,
            @Value("${app.storage.azure.operation-timeout}")
            Duration operationTimeout
    ) {
        this.blobServiceClient = blobServiceClient;
        this.operationTimeout = operationTimeout;
    }

    @Override
    public String generate(
            BlobClient blobClient,
            OffsetDateTime startsAt,
            OffsetDateTime expiresAt
    ) {
        UserDelegationKey delegationKey =
                blobServiceClient.getUserDelegationKeyWithResponse(
                        startsAt,
                        expiresAt,
                        operationTimeout,
                        Context.NONE
                ).getValue();

        BlobSasPermission permissions =
                new BlobSasPermission()
                        .setCreatePermission(true);

        BlobServiceSasSignatureValues signature =
                new BlobServiceSasSignatureValues(
                        expiresAt,
                        permissions
                )
                        .setStartTime(startsAt)
                        .setProtocol(SasProtocol.HTTPS_ONLY);

        return blobClient.generateUserDelegationSas(
                signature,
                delegationKey
        );
    }
}