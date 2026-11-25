package org.welhire.b2c.cv.internal.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.welhire.b2c.cv.internal.domain.CvAnalysisStatus;
import org.welhire.b2c.cv.internal.domain.CvParsingStatus;
import org.welhire.b2c.cv.internal.domain.CvUploadStatus;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import static java.util.Objects.requireNonNull;

@Entity
@Table(name = "cv_uploads")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CvUpload {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "guest_id", nullable = false, updatable = false)
    private UUID guestId;

    @Column(
            name = "original_file_name",
            nullable = false,
            updatable = false,
            length = 255
    )
    private String originalFileName;

    @Column(
            name = "declared_content_type",
            nullable = false,
            updatable = false,
            length = 100
    )
    private String declaredContentType;

    @Column(
            name = "expected_size_bytes",
            nullable = false,
            updatable = false
    )
    private long expectedSizeBytes;

    @Column(
            name = "object_key",
            nullable = false,
            updatable = false,
            length = 512
    )
    private String objectKey;

    @Column(name = "storage_version", length = 255)
    private String storageVersion;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 24)
    private CvUploadStatus cvUploadStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "uploaded_at")
    private Instant uploadedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @Enumerated(EnumType.STRING)
    @Column(name = "parsing_status", nullable = false, length = 20)
    private CvParsingStatus parsingStatus = CvParsingStatus.NOT_STARTED;

    @Column(name = "parsing_started_at")
    private Instant parsingStartedAt;

    @Column(name = "parsing_completed_at")
    private Instant parsingCompletedAt;

    @Column(name = "parsing_failure_code", length = 100)
    private String parsingFailureCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "analysis_status", nullable = false, length = 20)
    private CvAnalysisStatus analysisStatus = CvAnalysisStatus.NOT_STARTED;

    @Column(name = "analysis_started_at")
    private Instant analysisStartedAt;

    @Column(name = "analysis_completed_at")
    private Instant analysisCompletedAt;

    @Column(name = "analysis_failure_code", length = 100)
    private String analysisFailureCode;

    public static CvUpload reserve(
            UUID cvId,
            UUID guestId,
            String originalFileName,
            String declaredContentType,
            long expectedSizeBytes,
            String objectKey,
            Instant createdAt
    ) {
        requireNonNull(cvId, "cvId is required");
        requireNonNull(guestId, "guestId is required");
        requireNonNull(createdAt, "createdAt is required");

        requireText(originalFileName, 255, "originalFileName");
        requireText(declaredContentType, 100, "declaredContentType");
        requireText(objectKey, 512, "objectKey");

        if (expectedSizeBytes <= 0) {
            throw new IllegalArgumentException(
                    "expectedSizeBytes must be positive"
            );
        }

        CvUpload upload = new CvUpload();

        upload.id = cvId;
        upload.guestId = guestId;
        upload.originalFileName = originalFileName;
        upload.declaredContentType = declaredContentType;
        upload.expectedSizeBytes = expectedSizeBytes;
        upload.objectKey = objectKey;
        upload.cvUploadStatus = CvUploadStatus.AWAITING_UPLOAD;
        upload.createdAt = createdAt;

        return upload;
    }

    private static void requireText(
            String value,
            int maximumLength,
            String field
    ) {
        if (value == null
                || value.isBlank()
                || value.length() > maximumLength) {
            throw new IllegalArgumentException(
                    field + " must contain 1 to "
                            + maximumLength + " characters"
            );
        }
    }

    public void markUploaded(String storageVersion, Instant uploadedAt) {
        if (cvUploadStatus == CvUploadStatus.UPLOADED) {
            return;
        }

        if (cvUploadStatus != CvUploadStatus.AWAITING_UPLOAD) {
            throw new IllegalStateException(
                    "CV upload cannot be completed from its current state."
            );
        }

        this.storageVersion = storageVersion;
        this.uploadedAt = requireNonNull(uploadedAt);
        this.cvUploadStatus = CvUploadStatus.UPLOADED;
    }

    public void startParsing(Instant now) {
        Objects.requireNonNull(now, "Parsing start time is required");

        if (cvUploadStatus != CvUploadStatus.UPLOADED) {
            throw new IllegalStateException(
                    "The CV must be uploaded before parsing."
            );
        }

        if (parsingStatus != CvParsingStatus.NOT_STARTED) {
            throw new IllegalStateException(
                    "Parsing can start only when it has not started."
            );
        }

        parsingStatus = CvParsingStatus.PROCESSING;
        parsingStartedAt = now;
        parsingCompletedAt = null;
        parsingFailureCode = null;
    }

    public void markParsingSucceeded(Instant now) {
        requireParsingInProgress(now);

        parsingStatus = CvParsingStatus.SUCCEEDED;
        parsingCompletedAt = now;
        parsingFailureCode = null;
    }

    public void markParsingFailed(String failureCode, Instant now) {
        requireParsingInProgress(now);

        if (failureCode == null
                || failureCode.isBlank()
                || failureCode.length() > 100) {
            throw new IllegalArgumentException(
                    "A failure code of 1 to 100 characters is required."
            );
        }

        parsingStatus = CvParsingStatus.FAILED;
        parsingCompletedAt = now;
        parsingFailureCode = failureCode;
    }

    private void requireParsingInProgress(Instant now) {
        Objects.requireNonNull(now, "Parsing completion time is required");

        if (parsingStatus != CvParsingStatus.PROCESSING) {
            throw new IllegalStateException(
                    "Parsing must be in progress before recording its outcome."
            );
        }
    }

    public void startAnalysis(Instant now) {
        Objects.requireNonNull(now, "Analysis start time is required");

        if (parsingStatus != CvParsingStatus.SUCCEEDED) {
            throw new IllegalStateException(
                    "CV parsing must succeed before analysis can start."
            );
        }

        if (analysisStatus != CvAnalysisStatus.NOT_STARTED) {
            throw new IllegalStateException(
                    "Analysis can start only when it has not started."
            );
        }

        analysisStatus = CvAnalysisStatus.PROCESSING;
        analysisStartedAt = now;
        analysisCompletedAt = null;
        analysisFailureCode = null;
    }

    public void markAnalysisSucceeded(Instant now) {
        requireAnalysisInProgress(now);

        analysisStatus = CvAnalysisStatus.SUCCEEDED;
        analysisCompletedAt = now;
        analysisFailureCode = null;
    }

    public void markAnalysisFailed(String failureCode, Instant now) {
        requireAnalysisInProgress(now);

        if (failureCode == null
                || failureCode.isBlank()
                || failureCode.length() > 100) {
            throw new IllegalArgumentException(
                    "A failure code of 1 to 100 characters is required."
            );
        }

        analysisStatus = CvAnalysisStatus.FAILED;
        analysisCompletedAt = now;
        analysisFailureCode = failureCode;
    }

    private void requireAnalysisInProgress(Instant now) {
        Objects.requireNonNull(now, "Analysis completion time is required");

        if (analysisStatus != CvAnalysisStatus.PROCESSING) {
            throw new IllegalStateException(
                    "Analysis must be in progress before recording its outcome."
            );
        }

        if (analysisStartedAt == null || now.isBefore(analysisStartedAt)) {
            throw new IllegalArgumentException(
                    "Analysis completion time cannot precede its start time."
            );
        }
    }
}