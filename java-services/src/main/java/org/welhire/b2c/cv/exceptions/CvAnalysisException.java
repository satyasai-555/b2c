package org.welhire.b2c.cv.exceptions;

import java.util.Objects;
import java.util.UUID;

public class CvAnalysisException extends RuntimeException {

    public enum Code {
        CONNECTION_FAILED,
        HTTP_ERROR,
        INVALID_RESPONSE
    }

    private final UUID cvId;
    private final Code code;
    private final Integer downstreamStatus;

    public CvAnalysisException(
            UUID cvId,
            Code code,
            String message,
            Integer downstreamStatus
    ) {
        super(message);
        this.cvId = Objects.requireNonNull(cvId, "cvId is required");
        this.code = Objects.requireNonNull(code, "code is required");
        this.downstreamStatus = downstreamStatus;
    }

    public UUID getCvId() {
        return cvId;
    }

    public Code getCode() {
        return code;
    }

    public Integer getDownstreamStatus() {
        return downstreamStatus;
    }
}