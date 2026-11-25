package org.welhire.b2c.cv.exceptions;

import java.util.UUID;

public class CvParsingException extends RuntimeException {

    public enum Code {
        INVALID_FILE,
        FILE_READ_FAILED,
        CONNECTION_FAILED,
        HTTP_ERROR,
        INVALID_RESPONSE
    }

    private final UUID cvId;
    private final Code code;
    private final Integer downstreamStatus;

    public CvParsingException(
            UUID cvId,
            Code code,
            String message,
            Integer downstreamStatus
    ) {
        super(message);
        this.cvId = cvId;
        this.code = code;
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