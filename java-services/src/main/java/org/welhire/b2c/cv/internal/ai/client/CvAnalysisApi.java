package org.welhire.b2c.cv.internal.ai.client;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.PostExchange;
import org.welhire.b2c.cv.internal.ai.dto.CvAnalysisRequest;
import org.welhire.b2c.cv.internal.ai.dto.CvAnalysisResponse;

import java.net.URI;

public interface CvAnalysisApi {

    @PostExchange(
            contentType = MediaType.APPLICATION_JSON_VALUE,
            accept = MediaType.APPLICATION_JSON_VALUE
    )
    CvAnalysisResponse analyze(
            URI endpoint,
            @RequestBody CvAnalysisRequest request
    );
}