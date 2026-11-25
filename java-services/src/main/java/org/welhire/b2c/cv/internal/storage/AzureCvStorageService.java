package org.welhire.b2c.cv.internal.storage;

import com.azure.core.util.Context;
import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.models.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.welhire.b2c.cv.exceptions.CvStorageException;
import org.welhire.b2c.cv.exceptions.CvUploadException;

import java.io.ByteArrayOutputStream;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
public class AzureCvStorageService {

    private static final String PDF = "application/pdf";

    private static final String DOCX =
            "application/vnd.openxmlformats-officedocument."
                    + "wordprocessingml.document";

    private final BlobServiceClient blobServiceClient;
    private final String containerName;
    private final Duration uploadUrlLifetime;
    private final Duration operationTimeout;
    private final CvSasGenerator sasGenerator;

    public AzureCvStorageService(
            @Qualifier("cvBlobServiceClient")
            BlobServiceClient blobServiceClient,
            @Value("${app.storage.azure.cv-container}")
            String containerName,
            @Value("${app.storage.azure.upload-url-lifetime}")
            Duration uploadUrlLifetime,
            @Value("${app.storage.azure.operation-timeout}")
            Duration operationTimeout,
            CvSasGenerator sasGenerator
    ) {
        if (containerName == null || containerName.isBlank()) {
            throw new IllegalArgumentException(
                    "CV container name is required"
            );
        }

        if (uploadUrlLifetime == null
                || uploadUrlLifetime.isZero()
                || uploadUrlLifetime.isNegative()
                || uploadUrlLifetime.compareTo(Duration.ofHours(1)) > 0) {
            throw new IllegalArgumentException(
                    "Upload URL lifetime must be positive and at most one hour"
            );
        }

        if (operationTimeout == null
                || operationTimeout.isZero()
                || operationTimeout.isNegative()) {
            throw new IllegalArgumentException(
                    "Storage operation timeout must be positive"
            );
        }

        this.blobServiceClient = blobServiceClient;
        this.containerName = containerName;
        this.uploadUrlLifetime = uploadUrlLifetime;
        this.operationTimeout = operationTimeout;
        this.sasGenerator = sasGenerator;
    }

    public CvUploadTarget createUploadTarget(
            UUID cvId,
            String contentType
    ) {
        Objects.requireNonNull(cvId, "cvId is required");

        String extension = extensionFor(contentType);
        String objectKey = "cvs/" + cvId + "/original." + extension;

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime startsAt = now.minusMinutes(5);
        OffsetDateTime expiresAt = now.plus(uploadUrlLifetime);

        long startedAt = System.nanoTime();

        try {
            log.debug(
                    "Creating Azure CV upload authorization cvId={}",
                    cvId
            );

            BlobClient blobClient = blobServiceClient
                    .getBlobContainerClient(containerName)
                    .getBlobClient(objectKey);

            String sas = sasGenerator.generate(
                    blobClient,
                    startsAt,
                    expiresAt
            );

            String uploadUrl = blobClient.getBlobUrl() + "?" + sas;

            log.info(
                    "Azure CV upload authorization created "
                            + "cvId={} expiresAt={} durationMs={}",
                    cvId,
                    expiresAt,
                    (System.nanoTime() - startedAt) / 1_000_000
            );

            return new CvUploadTarget(
                    objectKey,
                    uploadUrl,
                    expiresAt.toInstant(),
                    Map.of(
                            "Content-Type", contentType,
                            "x-ms-blob-type", "BlockBlob",
                            "If-None-Match", "*"
                    )
            );

        } catch (RuntimeException exception) {
            Integer status = exception instanceof BlobStorageException storage
                    ? storage.getStatusCode()
                    : null;

            // Do not log SDK exception messages or URLs:
            // they may contain sensitive request information.
            log.error(
                    "Azure CV upload authorization failed "
                            + "cvId={} status={} exceptionType={}",
                    cvId,
                    status,
                    exception.getClass().getSimpleName()
            );

            throw new CvStorageException();
        }
    }

    private String extensionFor(String contentType) {
        if (PDF.equals(contentType)) {
            return "pdf";
        }

        if (DOCX.equals(contentType)) {
            return "docx";
        }

        throw new IllegalArgumentException(
                "Only PDF and DOCX content types are supported"
        );
    }

    public UploadedBlobDetails getUploadedBlobDetails(
            UUID cvId,
            String objectKey
    ) {
        try {
            var properties = blobServiceClient
                    .getBlobContainerClient(containerName)
                    .getBlobClient(objectKey)
                    .getPropertiesWithResponse(
                            null,
                            operationTimeout,
                            Context.NONE
                    )
                    .getValue();

            log.debug(
                    "CV blob inspected: cvId={}, sizeBytes={}",
                    cvId,
                    properties.getBlobSize()
            );

            return new UploadedBlobDetails(
                    properties.getBlobSize(),
                    properties.getVersionId()
            );

        } catch (BlobStorageException exception) {
            // BlobNotFound means this particular file is not present.
            // Container/configuration failures must remain storage errors.
            if (BlobErrorCode.BLOB_NOT_FOUND.equals(exception.getErrorCode())) {
                log.warn("CV blob not found: cvId={}", cvId);

                throw new CvUploadException(
                        HttpStatus.CONFLICT,
                        "CV_UPLOAD_NOT_COMPLETE",
                        "The CV file has not finished uploading."
                );
            }

            log.error(
                    "CV blob inspection failed: cvId={}, storageStatus={}, errorCode={}",
                    cvId,
                    exception.getStatusCode(),
                    exception.getErrorCode()
            );

            throw new CvStorageException();

        } catch (RuntimeException exception) {
            log.error(
                    "CV blob inspection failed: cvId={}, exceptionType={}",
                    cvId,
                    exception.getClass().getSimpleName()
            );

            throw new CvStorageException();
        }
    }

    public byte[] downloadForParsing(
            UUID cvId,
            String objectKey,
            String storageVersion,
            long expectedSizeBytes,
            long maxFileBytes
    ) {
        if (expectedSizeBytes <= 0
                || expectedSizeBytes > maxFileBytes
                || expectedSizeBytes > Integer.MAX_VALUE) {
            throw new CvUploadException(
                    HttpStatus.UNPROCESSABLE_CONTENT,
                    "INVALID_CV_FILE_SIZE",
                    "The CV file size is invalid."
            );
        }

        try {
            var blobClient = blobServiceClient
                    .getBlobContainerClient(containerName)
                    .getBlobClient(objectKey);

            if (storageVersion != null && !storageVersion.isBlank()) {
                blobClient = blobClient.getVersionClient(storageVersion);
            }

            var properties = blobClient.getPropertiesWithResponse(
                    null,
                    operationTimeout,
                    Context.NONE
            ).getValue();

            if (properties.getBlobSize() != expectedSizeBytes) {
                throw new CvUploadException(
                        HttpStatus.CONFLICT,
                        "CV_FILE_CHANGED",
                        "The stored CV does not match the completed upload."
                );
            }

            var output = new ByteArrayOutputStream(
                    Math.toIntExact(expectedSizeBytes)
            );

            blobClient.downloadStreamWithResponse(
                    output,
                    new BlobRange(0, expectedSizeBytes),
                    new DownloadRetryOptions().setMaxRetryRequests(0),
                    new BlobRequestConditions()
                            .setIfMatch(properties.getETag()),
                    false,
                    operationTimeout,
                    Context.NONE
            );

            if (output.size() != expectedSizeBytes) {
                throw new CvStorageException();
            }

            log.info(
                    "CV downloaded for parsing: cvId={}, sizeBytes={}",
                    cvId,
                    output.size()
            );

            return output.toByteArray();

        } catch (CvUploadException | CvStorageException exception) {
            throw exception;

        } catch (RuntimeException exception) {
            log.error(
                    "CV download failed: cvId={}, exceptionType={}",
                    cvId,
                    exception.getClass().getSimpleName()
            );

            throw new CvStorageException();
        }
    }
}