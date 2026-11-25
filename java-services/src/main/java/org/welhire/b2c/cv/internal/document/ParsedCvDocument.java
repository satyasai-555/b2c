package org.welhire.b2c.cv.internal.document;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.welhire.b2c.cv.internal.ai.dto.CvParsingResponse;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Document(collection = "parsed_cvs")
public class ParsedCvDocument {

    @Id
    private String cvId;

    private String guestId;

    private int schemaVersion;

    private CvParsingResponse parsedData;

    private Instant parsedAt;

    public static ParsedCvDocument create(
            UUID cvId,
            UUID guestId,
            CvParsingResponse parsedData
    ) {
        ParsedCvDocument document = new ParsedCvDocument();

        document.cvId = Objects.requireNonNull(cvId).toString();
        document.guestId = Objects.requireNonNull(guestId).toString();
        document.schemaVersion = 1;
        document.parsedData = Objects.requireNonNull(parsedData);
        document.parsedAt = Instant.now();

        return document;
    }
}