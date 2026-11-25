package org.welhire.b2c.cv.internal.ai.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CvAnalysisResponse(
        UUID cvId,
        String candidateName,
        String targetRole,
        ResumeScore resumeScore,
        String summary,
        SkillCategory hardSkills,
        SkillCategory softSkills,
        SkillCategory behavioralSkills,
        List<PositiveSignal> whatsWorking,
        List<SuggestedFix> whatsHoldingItBack,
        Usage usage
) {

    public record ResumeScore(
            BigDecimal score,
            Integer weightedCriteria,
            BigDecimal projectedScore
    ) {
    }

    public record SkillCategory(
            BigDecimal totalScore,
            List<Skill> skills
    ) {
    }

    public record Skill(
            String skill,
            BigDecimal score,
            String level
    ) {
    }

    public record PositiveSignal(
            String title,
            String evidence
    ) {
    }

    public record SuggestedFix(
            String priority,
            String issue
    ) {
    }

    public record Usage(
            Long embeddingTokens,
            Long llmPromptTokens,
            Long llmCompletionTokens,
            Long totalLlmTokenCount
    ) {
    }
}