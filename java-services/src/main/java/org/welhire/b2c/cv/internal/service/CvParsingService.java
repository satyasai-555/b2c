package org.welhire.b2c.cv.internal.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.welhire.b2c.cv.exceptions.CvUploadException;
import org.welhire.b2c.cv.internal.ai.client.CvParsingClient;
import org.welhire.b2c.cv.internal.ai.dto.CvParsingRequest;
import org.welhire.b2c.cv.internal.ai.dto.CvParsingResponse;
import org.welhire.b2c.cv.internal.document.ParsedCvDocument;
import org.welhire.b2c.cv.internal.domain.CvUploadStatus;
import org.welhire.b2c.cv.internal.repository.CvUploadRepository;
import org.welhire.b2c.cv.internal.repository.ParsedCvRepository;
import org.welhire.b2c.cv.internal.storage.AzureCvStorageService;

import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@ConditionalOnProperty(
        prefix = "integrations.ai.cv-parsing",
        name = "enabled",
        havingValue = "true"
)
public class CvParsingService {

    private final CvUploadRepository uploadRepository;
    private final ParsedCvRepository parsedCvRepository;
    private final AzureCvStorageService storageService;
    private final CvParsingClient parsingClient;
    private final long maxFileBytes;

    public CvParsingService(
            CvUploadRepository uploadRepository,
            ParsedCvRepository parsedCvRepository,
            AzureCvStorageService storageService,
            CvParsingClient parsingClient,
            @Value("${app.cv.max-file-bytes}") long maxFileBytes
    ) {
        if (maxFileBytes <= 0 || maxFileBytes > Integer.MAX_VALUE) {
            throw new IllegalArgumentException(
                    "Maximum CV file size is invalid."
            );
        }

        this.uploadRepository = uploadRepository;
        this.parsedCvRepository = parsedCvRepository;
        this.storageService = storageService;
        this.parsingClient = parsingClient;
        this.maxFileBytes = maxFileBytes;
    }

    public ParsedCvDocument parseAndStore(
            UUID cvId,
            UUID guestId
    ) {
        Objects.requireNonNull(cvId);
        Objects.requireNonNull(guestId);

        long startedAt = System.nanoTime();

        var upload = uploadRepository
                .findByIdAndGuestId(cvId, guestId)
                .orElseThrow(() -> new CvUploadException(
                        HttpStatus.NOT_FOUND,
                        "CV_UPLOAD_NOT_FOUND",
                        "CV upload was not found."
                ));

        // Reuse an already persisted result during recovery.
        var existing = parsedCvRepository.findByCvIdAndGuestId(
                cvId.toString(),
                guestId.toString()
        );

        if (existing.isPresent()) {
            log.info(
                    "Existing parsed CV reused: cvId={}, guestId={}",
                    cvId,
                    guestId
            );

            return existing.get();
        }

        if (upload.getCvUploadStatus() != CvUploadStatus.UPLOADED) {
            throw new CvUploadException(
                    HttpStatus.CONFLICT,
                    "CV_UPLOAD_NOT_COMPLETE",
                    "Complete the CV upload before parsing."
            );
        }

        log.info(
                "CV parsing started: cvId={}, guestId={}",
                cvId,
                guestId
        );

        byte[] fileBytes = storageService.downloadForParsing(
                cvId,
                upload.getObjectKey(),
                upload.getStorageVersion(),
                upload.getExpectedSizeBytes(),
                maxFileBytes
        );

        CvParsingResponse response = parsingClient.parse(
                cvId,
                new CvParsingRequest(
                        new ByteArrayResource(fileBytes),
                        upload.getOriginalFileName(),
                        upload.getDeclaredContentType()
                )
        );

        // The existing client must validate the AI response before returning.
        Objects.requireNonNull(
                response,
                "CV parsing client returned no response."
        );

        var document = ParsedCvDocument.create(
                cvId,
                guestId,
                response
        );

        try {
            ParsedCvDocument stored = parsedCvRepository.insert(document);

            log.info(
                    "CV parsing result stored: cvId={}, guestId={}, durationMs={}",
                    cvId,
                    guestId,
                    (System.nanoTime() - startedAt) / 1_000_000
            );

            return stored;

        } catch (DuplicateKeyException exception) {
            // Another execution may have stored the same CV meanwhile.
            var stored = parsedCvRepository.findByCvIdAndGuestId(
                    cvId.toString(),
                    guestId.toString()
            );

            if (stored.isEmpty()) {
                throw exception;
            }

            log.info(
                    "Concurrent CV parsing result reused: cvId={}",
                    cvId
            );

            return stored.get();
        }
    }
}