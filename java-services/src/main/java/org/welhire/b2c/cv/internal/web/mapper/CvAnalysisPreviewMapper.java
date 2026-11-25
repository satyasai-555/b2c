package org.welhire.b2c.cv.internal.web.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import org.welhire.b2c.cv.internal.ai.dto.CvAnalysisResponse;
import org.welhire.b2c.cv.internal.document.CvAnalysisDocument;
import org.welhire.b2c.cv.internal.web.dto.CvAnalysisPreviewResponse;

import java.math.BigDecimal;
import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.ERROR
)
public interface CvAnalysisPreviewMapper {

    @Mapping(target = "cvId", source = "cvId")
    @Mapping(target = "targetRole", source = "analysisRequest.targetRole")
    @Mapping(target = "score", source = "analysisData.resumeScore.score")
    @Mapping(
            target = "estimatedImprovementPoints",
            source = "analysisData.resumeScore",
            qualifiedByName = "estimatedImprovement"
    )
    @Mapping(
            target = "suggestedFixesCount",
            source = "analysisData.whatsHoldingItBack",
            qualifiedByName = "fixCount"
    )
    @Mapping(
            target = "assessedSkillsCount",
            source = "analysisData",
            qualifiedByName = "skillCount"
    )
    CvAnalysisPreviewResponse toResponse(CvAnalysisDocument document);

    @Named("estimatedImprovement")
    default BigDecimal estimatedImprovement(
            CvAnalysisResponse.ResumeScore resumeScore
    ) {
        if (resumeScore == null
                || resumeScore.score() == null
                || resumeScore.projectedScore() == null) {
            return null;
        }

        return resumeScore.projectedScore().subtract(resumeScore.score());
    }

    @Named("fixCount")
    default Integer fixCount(List<CvAnalysisResponse.SuggestedFix> fixes) {
        return fixes == null ? null : fixes.size();
    }

    @Named("skillCount")
    default Integer skillCount(CvAnalysisResponse analysis) {
        if (analysis == null
                || analysis.hardSkills() == null
                || analysis.hardSkills().skills() == null
                || analysis.softSkills() == null
                || analysis.softSkills().skills() == null
                || analysis.behavioralSkills() == null
                || analysis.behavioralSkills().skills() == null) {
            return null;
        }

        return analysis.hardSkills().skills().size()
                + analysis.softSkills().skills().size()
                + analysis.behavioralSkills().skills().size();
    }
}