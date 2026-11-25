package org.welhire.b2c.cv.internal.ai.mock;

import lombok.extern.slf4j.Slf4j;
import org.welhire.b2c.cv.internal.ai.client.CvAnalysisApi;
import org.welhire.b2c.cv.internal.ai.dto.CvAnalysisRequest;
import org.welhire.b2c.cv.internal.ai.dto.CvAnalysisResponse;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

@Slf4j
public class MockCvAnalysisApi implements CvAnalysisApi {

    @Override
    public CvAnalysisResponse analyze(
            URI endpoint,
            CvAnalysisRequest request
    ) {
        log.info(
                "Returning mocked CV analysis response: cvId={}",
                request.cvId()
        );

        return new CvAnalysisResponse(
                request.cvId(),

                "Alex Sharma",

                request.targetRole(),

                new CvAnalysisResponse.ResumeScore(
                        BigDecimal.valueOf(76),
                        12,
                        BigDecimal.valueOf(92)
                ),

                "Your CV demonstrates strong technical expertise "
                        + "and relevant professional experience for the "
                        + request.targetRole()
                        + " role. Improving measurable achievements "
                        + "and skill alignment can strengthen your profile.",

                // Hard skills
                new CvAnalysisResponse.SkillCategory(
                        BigDecimal.valueOf(80),
                        List.of(
                                skill("Java", 90, "Advanced"),
                                skill("Spring Boot", 85, "Advanced"),
                                skill("REST APIs", 85, "Advanced"),
                                skill("PostgreSQL", 80, "Advanced"),
                                skill("MongoDB", 75, "Intermediate"),
                                skill("Docker", 70, "Intermediate"),
                                skill("Kafka", 75, "Intermediate")
                        )
                ),

                // Soft skills
                new CvAnalysisResponse.SkillCategory(
                        BigDecimal.valueOf(75),
                        List.of(
                                skill("Communication", 80, "Advanced"),
                                skill("Teamwork", 75, "Intermediate"),
                                skill("Problem Solving", 70, "Intermediate")
                        )
                ),

                // Behavioral skills
                new CvAnalysisResponse.SkillCategory(
                        BigDecimal.valueOf(73),
                        List.of(
                                skill("Adaptability", 75, "Intermediate"),
                                skill("Ownership", 75, "Intermediate"),
                                skill("Analytical Thinking", 69, "Intermediate")
                        )
                ),

                // What's working
                List.of(
                        new CvAnalysisResponse.PositiveSignal(
                                "Strong technical foundation",
                                "Demonstrates relevant experience in Java, "
                                        + "Spring Boot and REST API development."
                        ),
                        new CvAnalysisResponse.PositiveSignal(
                                "Relevant professional experience",
                                "Contains 4.5 years of software development "
                                        + "and backend engineering experience."
                        ),
                        new CvAnalysisResponse.PositiveSignal(
                                "Relevant project experience",
                                "Includes backend development projects "
                                        + "using relational and NoSQL databases."
                        )
                ),

                // What's holding it back
                List.of(
                        new CvAnalysisResponse.SuggestedFix(
                                "High",
                                "Add measurable achievements and business "
                                        + "impact to employment history."
                        ),
                        new CvAnalysisResponse.SuggestedFix(
                                "Medium",
                                "Improve alignment with the target role "
                                        + "by highlighting relevant technical skills."
                        ),
                        new CvAnalysisResponse.SuggestedFix(
                                "Low",
                                "Include relevant certifications "
                                        + "and professional accomplishments."
                        )
                ),

                new CvAnalysisResponse.Usage(
                        0L,
                        0L,
                        0L,
                        0L
                )
        );
    }

    private CvAnalysisResponse.Skill skill(
            String name,
            int score,
            String level
    ) {
        return new CvAnalysisResponse.Skill(
                name,
                BigDecimal.valueOf(score),
                level
        );
    }
}