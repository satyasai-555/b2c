package org.welhire.b2c.cv.exceptions;

public class CvStorageException extends RuntimeException {

    public CvStorageException() {
        super("CV storage is temporarily unavailable.");
    }
}