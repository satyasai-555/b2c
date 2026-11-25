package org.welhire.b2c.cv.internal.document;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.welhire.b2c.cv.internal.ai.dto.CvAnalysisRequest;
import org.welhire.b2c.cv.internal.ai.dto.CvAnalysisResponse;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Document(collection = "cv_analyses")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CvAnalysisDocument {

    @Id
    private String cvId;

    private String guestId;

    private int schemaVersion;

    private CvAnalysisRequest analysisRequest;

    private CvAnalysisResponse analysisData;

    private Instant analyzedAt;

    public static CvAnalysisDocument create(
            UUID cvId,
            UUID guestId,
            CvAnalysisRequest analysisRequest,
            CvAnalysisResponse analysisData,
            Instant analyzedAt
    ) {
        Objects.requireNonNull(cvId, "cvId is required");
        Objects.requireNonNull(guestId, "guestId is required");
        Objects.requireNonNull(analysisRequest, "analysisRequest is required");
        Objects.requireNonNull(analysisData, "analysisData is required");
        Objects.requireNonNull(analyzedAt, "analyzedAt is required");

        if (!cvId.equals(analysisRequest.cvId())) {
            throw new IllegalArgumentException(
                    "Analysis request must belong to the specified CV."
            );
        }

        if (!cvId.equals(analysisData.cvId())) {
            throw new IllegalArgumentException(
                    "Analysis response must belong to the specified CV."
            );
        }

        var document = new CvAnalysisDocument();
        document.cvId = cvId.toString();
        document.guestId = guestId.toString();
        document.schemaVersion = 1;
        document.analysisRequest = analysisRequest;
        document.analysisData = analysisData;
        document.analyzedAt = analyzedAt;

        return document;
    }
}