package org.welhire.b2c.cv.internal.ai.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.welhire.b2c.cv.exceptions.CvParsingException;
import org.welhire.b2c.cv.internal.ai.dto.CvParsingRequest;
import org.welhire.b2c.cv.internal.ai.dto.CvParsingResponse;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.Objects;
import java.util.UUID;

import static org.welhire.b2c.cv.exceptions.CvParsingException.Code;

public class CvParsingClient {

    private static final Logger log =
            LoggerFactory.getLogger(CvParsingClient.class);

    private static final String PDF = "application/pdf";

    private static final String DOCX =
            "application/vnd.openxmlformats-officedocument."
                    + "wordprocessingml.document";

    private final CvParsingApi api;
    private final URI endpoint;
    private final int maxFileBytes;

    public CvParsingClient(
            CvParsingApi api,
            URI endpoint,
            int maxFileBytes
    ) {
        this.api = Objects.requireNonNull(api);
        this.endpoint = Objects.requireNonNull(endpoint);

        if (maxFileBytes <= 0 || maxFileBytes == Integer.MAX_VALUE) {
            throw new IllegalArgumentException(
                    "maxFileBytes must be positive and below Integer.MAX_VALUE"
            );
        }

        this.maxFileBytes = maxFileBytes;
    }

    public CvParsingResponse parse(UUID cvId, CvParsingRequest request) {
        Objects.requireNonNull(cvId, "cvId is required");
        Objects.requireNonNull(request, "request is required");

        Objects.requireNonNull(request.file(), "file is required");

        String contentType = request.contentType();

        if (!PDF.equals(contentType) && !DOCX.equals(contentType)) {
            throw failure(
                    cvId,
                    Code.INVALID_FILE,
                    "Only PDF and DOCX files are supported",
                    null
            );
        }

        byte[] bytes = readFile(cvId, request);

        // The original filename is not needed by the AI parser.
        String outboundFileName = PDF.equals(contentType)
                ? "cv.pdf"
                : "cv.docx";

        Resource resource = new ByteArrayResource(bytes) {
            @Override
            public String getFilename() {
                return outboundFileName;
            }
        };

        var headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDisposition(
                ContentDisposition.formData()
                        .name("file")
                        .filename(outboundFileName)
                        .build()
        );

        var filePart = new HttpEntity<>(resource, headers);
        long startedAt = System.nanoTime();

        try {
            log.info("CV parsing started requestId={}", cvId);

            CvParsingResponse response = api.parse(
                    endpoint,
                    filePart
            );

            if (response == null) {
                throw failure(
                        cvId,
                        Code.INVALID_RESPONSE,
                        "AI returned an empty parsing response",
                        null
                );
            }

            log.info(
                    "CV parsing completed requestId={} durationMs={}",
                    cvId,
                    (System.nanoTime() - startedAt) / 1_000_000
            );

            return response;

        } catch (RestClientResponseException exception) {
            throw failure(
                    cvId,
                    Code.HTTP_ERROR,
                    "AI parsing returned an unsuccessful HTTP status",
                    exception.getStatusCode().value()
            );

        } catch (ResourceAccessException exception) {
            throw failure(
                    cvId,
                    Code.CONNECTION_FAILED,
                    "AI parsing connection failed or timed out",
                    null
            );

        } catch (RestClientException exception) {
            throw failure(
                    cvId,
                    Code.INVALID_RESPONSE,
                    "Could not process the AI parsing response",
                    null
            );
        }
    }

    private byte[] readFile(UUID cvId, CvParsingRequest request) {
        try (InputStream input = request.file().getInputStream()) {
            byte[] bytes = input.readNBytes(maxFileBytes + 1);

            if (bytes.length == 0 || bytes.length > maxFileBytes) {
                throw failure(
                        cvId,
                        Code.INVALID_FILE,
                        "CV file is empty or exceeds the configured size limit",
                        null
                );
            }

            return bytes;

        } catch (IOException exception) {
            throw failure(
                    cvId,
                    Code.FILE_READ_FAILED,
                    "Could not read the CV file",
                    null
            );
        }
    }

    private CvParsingException failure(
            UUID cvId,
            Code code,
            String message,
            Integer downstreamStatus
    ) {
        log.warn(
                "CV parsing failed cvId={} code={} downstreamStatus={}",
                cvId,
                code,
                downstreamStatus
        );

        return new CvParsingException(
                cvId,
                code,
                message,
                downstreamStatus
        );
    }
}