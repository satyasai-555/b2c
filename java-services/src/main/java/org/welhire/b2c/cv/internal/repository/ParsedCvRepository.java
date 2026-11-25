package org.welhire.b2c.cv.internal.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.welhire.b2c.cv.internal.document.ParsedCvDocument;

import java.util.Optional;

public interface ParsedCvRepository
        extends MongoRepository<ParsedCvDocument, String> {

    Optional<ParsedCvDocument> findByCvIdAndGuestId(
            String cvId,
            String guestId
    );
}