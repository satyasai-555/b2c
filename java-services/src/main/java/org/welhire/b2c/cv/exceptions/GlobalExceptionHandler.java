package org.welhire.b2c.cv.exceptions;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.welhire.b2c.cv.internal.web.controller.CvUploadController;
import org.welhire.b2c.guest.exceptions.InvalidGuestCredentialException;

@Slf4j
@RestControllerAdvice(assignableTypes = CvUploadController.class)
public class GlobalExceptionHandler {

    @ExceptionHandler(CvUploadException.class)
    public ResponseEntity<UploadError> handleCvUpload(
            CvUploadException exception
    ) {
        log.warn(
                "CV request rejected: code={}, status={}",
                exception.getCode(),
                exception.getStatus().value()
        );

        return error(
                exception.getStatus(),
                exception.getCode(),
                exception.getMessage()
        );
    }

    @ExceptionHandler({
            MethodArgumentNotValidException.class,
            HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class
    })
    public ResponseEntity<UploadError> handleInvalidRequest(
            Exception exception
    ) {
        log.warn(
                "Invalid CV request: exceptionType={}",
                exception.getClass().getSimpleName()
        );

        return error(
                HttpStatus.BAD_REQUEST,
                "INVALID_CV_REQUEST",
                "The request contains missing or invalid values."
        );
    }

    @ExceptionHandler(InvalidGuestCredentialException.class)
    public ResponseEntity<UploadError> handleInvalidGuest() {
        return error(
                HttpStatus.UNAUTHORIZED,
                "INVALID_GUEST_SESSION",
                "Your guest session is missing, invalid or expired."
        );
    }

    @ExceptionHandler(CvParsingException.class)
    public ResponseEntity<UploadError> handleParsing(
            CvParsingException exception
    ) {
        log.warn(
                "CV parsing request failed: cvId={}, code={}, downstreamStatus={}",
                exception.getCvId(),
                exception.getCode(),
                exception.getDownstreamStatus()
        );

        return switch (exception.getCode()) {
            case INVALID_FILE -> error(
                    HttpStatus.UNPROCESSABLE_CONTENT,
                    "CV_PARSING_INVALID_FILE",
                    "The CV file is empty or unsupported for parsing."
            );

            case FILE_READ_FAILED -> error(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "CV_PARSING_FILE_READ_FAILED",
                    "The CV file could not be read for parsing."
            );

            case CONNECTION_FAILED -> error(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "CV_PARSING_CONNECTION_FAILED",
                    "The parsing service could not be reached or did not respond in time."
            );

            case HTTP_ERROR -> error(
                    HttpStatus.BAD_GATEWAY,
                    "CV_PARSING_HTTP_ERROR",
                    "The parsing service returned an unsuccessful response."
            );

            case INVALID_RESPONSE -> error(
                    HttpStatus.BAD_GATEWAY,
                    "CV_PARSING_INVALID_RESPONSE",
                    "The parsing service returned an invalid response."
            );
        };
    }

    @ExceptionHandler(CvStorageException.class)
    public ResponseEntity<UploadError> handleStorage() {
        return error(
                HttpStatus.SERVICE_UNAVAILABLE,
                "UPLOAD_STORAGE_UNAVAILABLE",
                "CV storage is temporarily unavailable."
        );
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<UploadError> handleDatabase(
            DataAccessException exception
    ) {
        log.error(
                "CV persistence operation failed: exceptionType={}",
                exception.getClass().getSimpleName()
        );

        return error(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "CV_PERSISTENCE_FAILED",
                "The CV request could not be completed because of a data storage error."
        );
    }

    private ResponseEntity<UploadError> error(
            HttpStatus status,
            String code,
            String message
    ) {
        return ResponseEntity.status(status)
                .cacheControl(CacheControl.noStore())
                .body(new UploadError(code, message));
    }

    public record UploadError(String code, String message) {
    }

    @ExceptionHandler(CvAnalysisException.class)
    public ResponseEntity<UploadError> handleAnalysis(
            CvAnalysisException exception
    ) {
        log.warn(
                "CV analysis request failed: cvId={}, code={}, downstreamStatus={}",
                exception.getCvId(),
                exception.getCode(),
                exception.getDownstreamStatus()
        );

        return switch (exception.getCode()) {
            case CONNECTION_FAILED -> error(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "CV_ANALYSIS_CONNECTION_FAILED",
                    "CV analysis is temporarily unavailable."
            );

            case HTTP_ERROR -> error(
                    HttpStatus.BAD_GATEWAY,
                    "CV_ANALYSIS_HTTP_ERROR",
                    "The AI service could not complete CV analysis."
            );

            case INVALID_RESPONSE -> error(
                    HttpStatus.BAD_GATEWAY,
                    "CV_ANALYSIS_INVALID_RESPONSE",
                    "The AI service returned an invalid analysis result."
            );
        };
    }
}