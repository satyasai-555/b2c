package org.welhire.b2c.cv.internal.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record InitializeCvUploadRequest(

        @NotBlank
        @Size(max = 255)
        String fileName,

        @NotBlank
        @Size(max = 100)
        String contentType,

        @Positive
        long sizeBytes

) {
}