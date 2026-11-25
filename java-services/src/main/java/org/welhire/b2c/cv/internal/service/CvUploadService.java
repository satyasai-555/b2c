package org.welhire.b2c.cv.internal.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.welhire.b2c.cv.exceptions.CvUploadException;
import org.welhire.b2c.cv.internal.entity.CvUpload;
import org.welhire.b2c.cv.internal.repository.CvUploadRepository;
import org.welhire.b2c.cv.internal.storage.AzureCvStorageService;
import org.welhire.b2c.cv.internal.web.dto.InitializeCvUploadRequest;
import org.welhire.b2c.cv.internal.web.dto.InitializeCvUploadResponse;
import org.welhire.b2c.guest.GuestAccess;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
public class CvUploadService {

    private static final String PDF = "application/pdf";

    private static final String DOCX =
            "application/vnd.openxmlformats-officedocument."
                    + "wordprocessingml.document";

    private final GuestAccess guestAccess;
    private final CvUploadRepository uploadRepository;
    private final AzureCvStorageService storageService;
    private final long maxFileBytes;

    public CvUploadService(
            GuestAccess guestAccess,
            CvUploadRepository uploadRepository,
            AzureCvStorageService storageService,
            @Value("${app.cv.max-file-bytes}")
            long maxFileBytes
    ) {
        if (maxFileBytes <= 0) {
            throw new IllegalArgumentException(
                    "Maximum CV file size must be positive"
            );
        }

        this.guestAccess = guestAccess;
        this.uploadRepository = uploadRepository;
        this.storageService = storageService;
        this.maxFileBytes = maxFileBytes;
    }

    public InitializeCvUploadResponse initialize(
            InitializeCvUploadRequest request,
            HttpServletRequest servletRequest
    ) {
        // Reject invalid metadata before creating a guest.
        validateMetadata(request);

        UUID guestId = guestAccess.getOrCreateGuest(servletRequest);
        UUID cvId = UUID.randomUUID();

        long startedAt = System.nanoTime();

        log.info(
                "CV upload initialization started guestId={} cvId={} sizeBytes={}",
                guestId,
                cvId,
                request.sizeBytes()
        );

        // Network operation runs outside a business database transaction.
        var target = storageService.createUploadTarget(
                cvId,
                request.contentType()
        );

        CvUpload upload = CvUpload.reserve(
                cvId,
                guestId,
                request.fileName(),
                request.contentType(),
                request.sizeBytes(),
                target.objectKey(),
                Instant.now()
        );

        // Repository save commits before upload instructions are returned.
        uploadRepository.save(upload);

        log.info(
                "CV upload initialized guestId={} cvId={} status={} durationMs={}",
                guestId,
                cvId,
                upload.getCvUploadStatus(),
                (System.nanoTime() - startedAt) / 1_000_000
        );

        return new InitializeCvUploadResponse(
                cvId,
                upload.getCvUploadStatus().name(),
                new InitializeCvUploadResponse.UploadInstructions(
                        "PUT",
                        target.url(),
                        target.requiredHeaders(),
                        target.expiresAt()
                )
        );
    }

    private void validateMetadata(InitializeCvUploadRequest request) {
        String name = request.fileName();

        if (name == null
                || name.isBlank()
                || name.length() > 255
                || name.chars().anyMatch(Character::isISOControl)) {
            throw new CvUploadException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_UPLOAD_REQUEST",
                    "A valid file name is required."
            );
        }

        if (request.sizeBytes() > maxFileBytes) {
            throw new CvUploadException(
                    HttpStatus.CONTENT_TOO_LARGE,
                    "CV_FILE_TOO_LARGE",
                    "The CV exceeds the allowed file size."
            );
        }

        String lowerName = name.toLowerCase(Locale.ROOT);

        boolean pdf = PDF.equals(request.contentType())
                && lowerName.endsWith(".pdf");

        boolean docx = DOCX.equals(request.contentType())
                && lowerName.endsWith(".docx");

        if (!pdf && !docx) {
            throw new CvUploadException(
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "UNSUPPORTED_CV_FILE_TYPE",
                    "Upload a PDF or DOCX file."
            );
        }
    }
}