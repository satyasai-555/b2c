package org.welhire.b2c.cv.internal.ai.client;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.http.client.MockClientHttpRequest;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;
import org.welhire.b2c.cv.exceptions.CvParsingException;
import org.welhire.b2c.cv.internal.ai.dto.CvParsingRequest;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class CvParsingClientTests {

    private static final URI ENDPOINT =
            URI.create("https://ai.example.test/cv_parsing/");

    private static final UUID CV_ID =
            UUID.fromString("b31bde05-7880-4208-9708-2338ab40d2a1");

    private MockRestServiceServer server;
    private CvParsingClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();

        server = MockRestServiceServer.bindTo(builder).build();

        CvParsingApi api = HttpServiceProxyFactory
                .builderFor(RestClientAdapter.create(builder.build()))
                .build()
                .createClient(CvParsingApi.class);

        client = new CvParsingClient(
                api,
                ENDPOINT,
                10 * 1024 * 1024
        );
    }

    @Test
    void sendsOnlyFilePartAndMapsSingleObjectResponse() {
        server.expect(requestTo(ENDPOINT))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header(
                        "Accept",
                        MediaType.APPLICATION_JSON_VALUE
                ))
                .andExpect(headerDoesNotExist("X-Request-ID"))
                .andExpect(headerDoesNotExist("X-CV-ID"))
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.MULTIPART_FORM_DATA
                ))
                .andExpect(request -> {
                    var mockRequest = (MockClientHttpRequest) request;
                    String body = mockRequest.getBodyAsString();

                    long partCount = Pattern.compile(
                            "(?im)^Content-Disposition:"
                    ).matcher(body).results().count();

                    assertThat(partCount).isEqualTo(1L);

                    assertThat(body)
                            .contains("name=\"file\"")
                            .contains("filename=\"cv.pdf\"")
                            .contains("Content-Type: application/pdf")
                            .contains("%PDF-1.7 test-content")
                            .doesNotContain("name=\"requestId\"")
                            .doesNotContain("name=\"cvId\"")
                            .doesNotContain(CV_ID.toString())
                            .doesNotContain("candidate-original-name.pdf");
                })
                .andRespond(withSuccess(
                        """
                        {
                          "name": "Test Candidate",
                          "mobileNo": "9876543210",
                          "emailId": "candidate@example.com",
                          "dateOfBirth": "1999-05-19",
                          "location": "Mumbai, Maharashtra",
                          "matchedLocation": "Mumbai",
                          "gender": null,
                          "maritalStatus": "Single",
                          "languages": ["English", "Hindi"],
                          "education": ["B.Tech in Computer Science"],
                          "qualifications": [
                            {
                              "courseType": "Undergraduate",
                              "matchedEducation": "B.Tech"
                            }
                          ],
                          "universities": ["Example University"],
                          "year": ["2017-2021"],
                          "yearsOfExperience": 4.0,
                          "currentCompany": "Example Ltd",
                          "currentRole": "Software Engineer",
                          "EmploymentHistory": [
                            {
                              "companyName": "Previous Ltd",
                              "durationYears": 2.0,
                              "yearsWorked": "2021-2023",
                              "role": "Junior Software Engineer"
                            }
                          ],
                          "projects": [
                            {
                              "name": "Project Name",
                              "description": "Project description"
                            }
                          ],
                          "softwareSkills": ["Java", "Spring Boot"],
                          "softSkills": ["Communication", "Teamwork"],
                          "strengths": ["Problem Solving"],
                          "behaviourSkills": ["Adaptability"],
                          "summaryBrief": "Candidate summary",
                          "usage": {
                            "embeddingTokens": 100,
                            "llmPromptTokens": 200,
                            "llmCompletionTokens": 300,
                            "totalLlmTokenCount": 500
                          }
                        }
                        """,
                        MediaType.APPLICATION_JSON
                ));

        var response = client.parse(CV_ID, validRequest());

        assertThat(response.name()).isEqualTo("Test Candidate");
        assertThat(response.mobileNo()).isEqualTo("9876543210");
        assertThat(response.emailId())
                .isEqualTo("candidate@example.com");
        assertThat(response.dateOfBirth()).isEqualTo("1999-05-19");
        assertThat(response.gender()).isNull();

        assertThat(response.yearsOfExperience())
                .isEqualByComparingTo("4.0");

        assertThat(response.softwareSkills())
                .containsExactly("Java", "Spring Boot");

        assertThat(response.qualifications()).hasSize(1);
        assertThat(response.qualifications().getFirst().matchedEducation())
                .isEqualTo("B.Tech");

        assertThat(response.employmentHistory()).hasSize(1);
        var employment = response.employmentHistory().getFirst();

        assertThat(employment.companyName()).isEqualTo("Previous Ltd");
        assertThat(employment.durationYears())
                .isEqualByComparingTo("2.0");
        assertThat(employment.yearsWorked()).isEqualTo("2021-2023");
        assertThat(employment.role()).isEqualTo("Junior Software Engineer");

        assertThat(response.projects()).hasSize(1);
        assertThat(response.projects().getFirst().description())
                .isEqualTo("Project description");

        assertThat(response.usage()).isNotNull();
        assertThat(response.usage().embeddingTokens()).isEqualTo(100L);
        assertThat(response.usage().llmPromptTokens()).isEqualTo(200L);
        assertThat(response.usage().llmCompletionTokens()).isEqualTo(300L);
        assertThat(response.usage().totalLlmTokenCount()).isEqualTo(500L);

        server.verify();
    }

    @Test
    void rejectsArrayResponseInsteadOfSingleObject() {
        server.expect(requestTo(ENDPOINT))
                .andRespond(withSuccess(
                        """
                        [
                          {
                            "name": "Test Candidate"
                          }
                        ]
                        """,
                        MediaType.APPLICATION_JSON
                ));

        CvParsingException exception = assertThrows(
                CvParsingException.class,
                () -> client.parse(CV_ID, validRequest())
        );

        assertThat(exception.getCode())
                .isEqualTo(CvParsingException.Code.INVALID_RESPONSE);
        assertThat(exception.getCvId()).isEqualTo(CV_ID);

        server.verify();
    }

    @Test
    void rejectsEmptyResponseBody() {
        server.expect(requestTo(ENDPOINT))
                .andRespond(withSuccess(
                        "",
                        MediaType.APPLICATION_JSON
                ));

        CvParsingException exception = assertThrows(
                CvParsingException.class,
                () -> client.parse(CV_ID, validRequest())
        );

        assertThat(exception.getCode())
                .isEqualTo(CvParsingException.Code.INVALID_RESPONSE);
        assertThat(exception.getCvId()).isEqualTo(CV_ID);

        server.verify();
    }

    @Test
    void convertsAiFailureToSafeApplicationException() {
        server.expect(requestTo(ENDPOINT))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("""
                              {
                                "detail": "sensitive-downstream-information"
                              }
                              """));

        CvParsingException exception = assertThrows(
                CvParsingException.class,
                () -> client.parse(CV_ID, validRequest())
        );

        assertThat(exception.getCode())
                .isEqualTo(CvParsingException.Code.HTTP_ERROR);
        assertThat(exception.getDownstreamStatus()).isEqualTo(503);
        assertThat(exception.getCvId()).isEqualTo(CV_ID);
        assertThat(exception.getMessage())
                .doesNotContain("sensitive-downstream-information");
        assertThat(exception.getCause()).isNull();

        server.verify();
    }

    @Test
    void rejectsEmptyFileWithoutCallingAi() {
        var request = new CvParsingRequest(
                new ByteArrayResource(new byte[0]),
                "empty.pdf",
                MediaType.APPLICATION_PDF_VALUE
        );

        CvParsingException exception = assertThrows(
                CvParsingException.class,
                () -> client.parse(CV_ID, request)
        );

        assertThat(exception.getCode())
                .isEqualTo(CvParsingException.Code.INVALID_FILE);
        assertThat(exception.getCvId()).isEqualTo(CV_ID);

        // No HTTP requests were expected.
        server.verify();
    }

    private CvParsingRequest validRequest() {
        byte[] bytes = "%PDF-1.7 test-content"
                .getBytes(StandardCharsets.UTF_8);

        return new CvParsingRequest(
                new ByteArrayResource(bytes),
                "candidate-original-name.pdf",
                MediaType.APPLICATION_PDF_VALUE
        );
    }
}