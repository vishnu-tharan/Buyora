package com.buyora.api.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.Map;

/**
 * Standard API error response format.
 * All errors follow this structure for consistency.
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {
    private final Instant timestamp;
    private final int status;
    private final String code;
    private final String message;
    private final Map<String, String> fieldErrors;
    private final String traceId;
    private final String path;
}
