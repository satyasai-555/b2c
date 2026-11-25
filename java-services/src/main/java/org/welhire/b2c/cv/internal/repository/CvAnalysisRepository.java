package org.welhire.b2c.cv.internal.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.welhire.b2c.cv.internal.document.CvAnalysisDocument;

import java.util.Optional;

public interface CvAnalysisRepository
        extends MongoRepository<CvAnalysisDocument, String> {

    Optional<CvAnalysisDocument> findByCvIdAndGuestId(
            String cvId,
            String guestId
    );
}