package org.welhire.b2c.cv.internal.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CvAnalysisPreviewResponse(
        UUID cvId,
        String targetRole,
        BigDecimal score,
        BigDecimal estimatedImprovementPoints,
        Integer suggestedFixesCount,
        Integer assessedSkillsCount
) {
}