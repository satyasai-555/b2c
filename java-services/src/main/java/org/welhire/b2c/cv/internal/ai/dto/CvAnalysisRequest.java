package org.welhire.b2c.cv.internal.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.UUID;

public record CvAnalysisRequest(
        UUID cvId,
        String targetRole,
        Integer minExperience,

        @JsonInclude(JsonInclude.Include.ALWAYS)
        Integer maxExperience,

        String preferredLocation
) {
}