package org.welhire.b2c.cv.internal.ai.client;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.service.annotation.PostExchange;
import org.welhire.b2c.cv.internal.ai.dto.CvParsingResponse;

import java.net.URI;

public interface CvParsingApi {

    @PostExchange(
            contentType = MediaType.MULTIPART_FORM_DATA_VALUE,
            accept = MediaType.APPLICATION_JSON_VALUE
    )
    CvParsingResponse parse(
            URI endpoint,
            @RequestPart("file") HttpEntity<Resource> file
    );
}