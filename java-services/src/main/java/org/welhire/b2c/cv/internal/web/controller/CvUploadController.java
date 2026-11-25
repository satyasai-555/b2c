package org.welhire.b2c.cv.internal.web.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.welhire.b2c.cv.internal.service.*;
import org.welhire.b2c.cv.internal.web.dto.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cv-uploads")
@RequiredArgsConstructor
public class CvUploadController {

    private final CvUploadService uploadService;
    private final CvUploadCompletionService completionService;
    private final CvUploadStatusService statusService;
    private final CvGoalsService goalsService;
    private final CvAnalysisPreviewService analysisPreviewService;

    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<InitializeCvUploadResponse> initialize(
            @Valid @RequestBody InitializeCvUploadRequest request,
            HttpServletRequest servletRequest
    ) {
        var response = uploadService.initialize(
                request,
                servletRequest
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .cacheControl(CacheControl.noStore())
                .body(response);
    }

    @PostMapping(
            value = "/{cvId}/complete",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CompleteCvUploadResponse> complete(
            @PathVariable("cvId") UUID cvId,
            HttpServletRequest servletRequest
    ) {
        var response = completionService.complete(
                cvId,
                servletRequest
        );

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(response);
    }

    @GetMapping(
            value = "/{cvId}/status",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CvUploadStatusResponse> getStatus(
            @PathVariable("cvId") UUID cvId,
            HttpServletRequest servletRequest
    ) {
        var response = statusService.getStatus(
                cvId,
                servletRequest
        );

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(response);
    }

    @PutMapping(
            value = "/{cvId}/goals",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CvGoalsResponse> saveGoals(
            @PathVariable("cvId") UUID cvId,
            @Valid @RequestBody SaveCvGoalsRequest request,
            HttpServletRequest servletRequest
    ) {
        var response = goalsService.save(
                cvId,
                request,
                servletRequest
        );

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(response);
    }
    @PostMapping(
            value = "/{cvId}/analysis",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CvAnalysisPreviewResponse> analyze(
            @PathVariable("cvId") UUID cvId,
            HttpServletRequest servletRequest
    ) {
        var response = analysisPreviewService.analyze(
                cvId,
                servletRequest
        );

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(response);
    }

    @GetMapping(
            value = "/{cvId}/analysis/preview",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CvAnalysisPreviewResponse> getAnalysisPreview(
            @PathVariable("cvId") UUID cvId,
            HttpServletRequest servletRequest
    ) {
        var response = analysisPreviewService.getPreview(
                cvId,
                servletRequest
        );

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(response);
    }
}