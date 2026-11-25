package org.welhire.b2c.cv.internal.ai.validation;

import org.springframework.stereotype.Component;
import org.welhire.b2c.cv.exceptions.CvAnalysisException;
import org.welhire.b2c.cv.internal.ai.dto.CvAnalysisResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Component
public class CvAnalysisResponseValidator {

    private static final BigDecimal MAX_SCORE = BigDecimal.valueOf(100);

    public void validate(
            UUID expectedCvId,
            CvAnalysisResponse response
    ) {
        Objects.requireNonNull(expectedCvId, "expectedCvId is required");

        if (response == null) {
            throw invalid(expectedCvId, "AI returned an empty analysis.");
        }

        if (!expectedCvId.equals(response.cvId())) {
            throw invalid(
                    expectedCvId,
                    "AI analysis does not match the requested CV."
            );
        }

        var resumeScore = response.resumeScore();

        if (resumeScore == null) {
            throw invalid(
                    expectedCvId,
                    "AI analysis is missing resumeScore."
            );
        }

        requireScore(expectedCvId, resumeScore.score(), "score");
        requireScore(
                expectedCvId,
                resumeScore.projectedScore(),
                "projectedScore"
        );

        if (resumeScore.projectedScore().compareTo(resumeScore.score()) < 0) {
            throw invalid(
                    expectedCvId,
                    "AI projected score is below the current score."
            );
        }

        validateCategory(expectedCvId, response.hardSkills(), "hardSkills");
        validateCategory(expectedCvId, response.softSkills(), "softSkills");
        validateCategory(
                expectedCvId,
                response.behavioralSkills(),
                "behavioralSkills"
        );

        requireList(
                expectedCvId,
                response.whatsWorking(),
                "whatsWorking"
        );

        requireList(
                expectedCvId,
                response.whatsHoldingItBack(),
                "whatsHoldingItBack"
        );
    }

    private void validateCategory(
            UUID cvId,
            CvAnalysisResponse.SkillCategory category,
            String field
    ) {
        if (category == null) {
            throw invalid(cvId, "AI analysis is missing " + field + ".");
        }

        requireScore(cvId, category.totalScore(), field + ".totalScore");
        requireList(cvId, category.skills(), field + ".skills");

        for (var skill : category.skills()) {
            requireScore(cvId, skill.score(), field + ".skills.score");
        }
    }

    private void requireScore(
            UUID cvId,
            BigDecimal value,
            String field
    ) {
        if (value == null
                || value.compareTo(BigDecimal.ZERO) < 0
                || value.compareTo(MAX_SCORE) > 0) {
            throw invalid(
                    cvId,
                    "AI " + field + " must be between 0 and 100."
            );
        }
    }

    private void requireList(
            UUID cvId,
            List<?> values,
            String field
    ) {
        if (values == null || values.stream().anyMatch(Objects::isNull)) {
            throw invalid(
                    cvId,
                    "AI " + field + " must be an array without null entries."
            );
        }
    }

    private CvAnalysisException invalid(UUID cvId, String message) {
        return new CvAnalysisException(
                cvId,
                CvAnalysisException.Code.INVALID_RESPONSE,
                message,
                null
        );
    }
}