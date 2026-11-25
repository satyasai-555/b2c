package org.welhire.b2c.cv.internal.ai.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.welhire.b2c.cv.exceptions.CvAnalysisException;
import org.welhire.b2c.cv.internal.ai.dto.CvAnalysisRequest;
import org.welhire.b2c.cv.internal.ai.dto.CvAnalysisResponse;
import org.welhire.b2c.cv.internal.ai.validation.CvAnalysisResponseValidator;

import java.net.URI;
import java.util.Objects;
import java.util.UUID;

@Slf4j
public class CvAnalysisClient {

    private final CvAnalysisApi api;
    private final URI endpoint;
    private final CvAnalysisResponseValidator responseValidator;

    public CvAnalysisClient(
            CvAnalysisApi api,
            URI endpoint,
            CvAnalysisResponseValidator responseValidator
    ) {
        this.api = Objects.requireNonNull(api, "api is required");
        this.endpoint = Objects.requireNonNull(
                endpoint,
                "endpoint is required"
        );
        this.responseValidator = Objects.requireNonNull(
                responseValidator,
                "responseValidator is required"
        );
    }

    public CvAnalysisResponse analyze(CvAnalysisRequest request) {
        Objects.requireNonNull(request, "request is required");

        UUID cvId = Objects.requireNonNull(
                request.cvId(),
                "cvId is required"
        );

        final CvAnalysisResponse response;

        try {
            response = api.analyze(endpoint, request);

        } catch (RestClientResponseException exception) {
            throw failure(
                    cvId,
                    CvAnalysisException.Code.HTTP_ERROR,
                    "The AI service could not complete CV analysis.",
                    exception.getStatusCode().value(),
                    exception
            );

        } catch (ResourceAccessException exception) {
            throw failure(
                    cvId,
                    CvAnalysisException.Code.CONNECTION_FAILED,
                    "The AI service could not be reached or timed out.",
                    null,
                    exception
            );

        } catch (RestClientException exception) {
            throw failure(
                    cvId,
                    CvAnalysisException.Code.INVALID_RESPONSE,
                    "The AI service returned an unreadable analysis response.",
                    null,
                    exception
            );
        }

        responseValidator.validate(cvId, response);

        log.info("CV analysis response received: cvId={}", cvId);

        return response;
    }


    private CvAnalysisException failure(
            UUID cvId,
            CvAnalysisException.Code code,
            String message,
            Integer downstreamStatus,
            RestClientException exception
    ) {
        log.warn(
                "CV analysis call failed: cvId={}, code={}, "
                        + "downstreamStatus={}, exceptionType={}",
                cvId,
                code,
                downstreamStatus,
                exception.getClass().getSimpleName()
        );

        return new CvAnalysisException(
                cvId,
                code,
                message,
                downstreamStatus
        );
    }
}