package org.welhire.b2c.cv.internal.web.dto;

import java.time.Instant;
import java.util.UUID;

public record CvGoalsResponse(
        UUID cvId,
        String targetRole,
        Integer minExperience,
        Integer maxExperience,
        String preferredLocation,
        Instant updatedAt
) {
}