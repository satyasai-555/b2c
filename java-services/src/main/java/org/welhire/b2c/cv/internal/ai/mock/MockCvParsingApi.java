package org.welhire.b2c.cv.internal.ai.mock;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.welhire.b2c.cv.internal.ai.client.CvParsingApi;
import org.welhire.b2c.cv.internal.ai.dto.CvParsingResponse;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

@Slf4j
public class MockCvParsingApi implements CvParsingApi {

    @Override
    public CvParsingResponse parse(
            URI endpoint,
            HttpEntity<Resource> file
    ) {
        log.info("Returning mocked CV parsing response");

        return new CvParsingResponse(
                "Alex Sharma",
                "9000000000",
                "alex@example.com",
                "1998-06-15",
                "Hyderabad",
                "Hyderabad",
                "Not specified",
                "Not specified",

                List.of(
                        "English",
                        "Hindi",
                        "Telugu"
                ),

                List.of(
                        "B.Tech in Computer Science"
                ),

                List.of(
                        new CvParsingResponse.Qualification(
                                "UG",
                                "Bachelor of Technology"
                        )
                ),

                List.of("Example University"),

                List.of("2020"),

                new BigDecimal("4.5"),

                "Example Technologies",

                "Java Backend Developer",

                List.of(
                        new CvParsingResponse.EmploymentHistory(
                                "Example Technologies",
                                new BigDecimal("2.5"),
                                2024,
                                2026,
                                "Java Backend Developer"
                        ),

                        new CvParsingResponse.EmploymentHistory(
                                "Sample Software Solutions",
                                new BigDecimal("2.0"),
                                2022,
                                2024,
                                "Software Engineer"
                        )
                ),

                List.of(
                        new CvParsingResponse.Project(
                                "Recruitment Management Platform",
                                "Developed REST APIs using Java, "
                                        + "Spring Boot and PostgreSQL."
                        ),

                        new CvParsingResponse.Project(
                                "Candidate Management System",
                                "Implemented candidate data management "
                                        + "using Spring Boot and MongoDB."
                        )
                ),

                List.of(
                        "Java",
                        "Spring Boot",
                        "REST APIs",
                        "PostgreSQL",
                        "MongoDB",
                        "Docker",
                        "Git",
                        "Kafka"
                ),

                List.of(
                        "Communication",
                        "Teamwork",
                        "Problem Solving"
                ),

                List.of(
                        "Backend Development",
                        "API Design",
                        "Database Management"
                ),

                List.of(
                        "Adaptability",
                        "Ownership",
                        "Analytical Thinking"
                ),

                "Java Backend Developer with 4.5 years "
                        + "of experience in developing scalable "
                        + "applications using Spring Boot, REST APIs "
                        + "and relational and NoSQL databases.",

                new CvParsingResponse.Usage(
                        0L,
                        0L,
                        0L,
                        0L
                )
        );
    }
}