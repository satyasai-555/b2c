package org.welhire.b2c.cv.internal.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

public record CvParsingResponse(
        String name,
        String mobileNo,
        String emailId,
        String dateOfBirth,
        String location,
        String matchedLocation,
        String gender,
        String maritalStatus,
        List<String> languages,
        List<String> education,
        List<Qualification> qualifications,
        List<String> universities,
        List<String> year,
        BigDecimal yearsOfExperience,
        String currentCompany,
        String currentRole,

        @JsonProperty("EmploymentHistory")
        List<EmploymentHistory> employmentHistory,

        List<Project> projects,
        List<String> softwareSkills,
        List<String> softSkills,
        List<String> strengths,
        List<String> behaviourSkills,
        String summaryBrief,
        Usage usage
) {

    public record Qualification(
            String courseType,
            String matchedEducation
    ) {
    }

    public record EmploymentHistory(
            String companyName,
            BigDecimal durationYears,
            String yearsWorked,
            String role
    ) {
    }

    public record Project(
            String name,
            String description
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