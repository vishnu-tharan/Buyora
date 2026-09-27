package com.buyora.api.common.handler;

import com.buyora.api.common.dto.ApiError;
import com.buyora.api.common.exception.BuyoraException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Centralized exception handler.
 * Maps exceptions to consistent ApiError responses.
 * Never exposes stack traces or internal details.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler({IllegalArgumentException.class, org.springframework.http.converter.HttpMessageNotReadableException.class})
    public ResponseEntity<ApiError> invalidRequest(Exception ex, HttpServletRequest request) {
        return ResponseEntity.badRequest().body(buildError(400, "INVALID_REQUEST", "Please check the supplied details",
                null, generateTraceId(), request.getRequestURI()));
    }

    @ExceptionHandler({IllegalStateException.class, org.springframework.dao.DataIntegrityViolationException.class})
    public ResponseEntity<ApiError> conflict(Exception ex, HttpServletRequest request) {
        return ResponseEntity.status(409).body(buildError(409, "CONFLICT", "This action cannot be completed in the current state",
                null, generateTraceId(), request.getRequestURI()));
    }

    @ExceptionHandler(BuyoraException.class)
    public ResponseEntity<ApiError> handleBuyoraException(
            BuyoraException ex, HttpServletRequest request) {
        String traceId = generateTraceId();
        log.warn("[{}] BuyoraException: {} - {}", traceId, ex.getCode(), ex.getMessage());
        return ResponseEntity.status(ex.getStatus())
                .body(buildError(ex.getStatus().value(), ex.getCode(), ex.getMessage(),
                        null, traceId, request.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        String traceId = generateTraceId();
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.badRequest()
                .body(buildError(400, "VALIDATION_ERROR", "Request validation failed",
                        fieldErrors, traceId, request.getRequestURI()));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {
        String traceId = generateTraceId();
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (ConstraintViolation<?> cv : ex.getConstraintViolations()) {
            String field = cv.getPropertyPath().toString();
            fieldErrors.put(field.contains(".") ? field.substring(field.lastIndexOf('.') + 1) : field,
                    cv.getMessage());
        }
        return ResponseEntity.badRequest()
                .body(buildError(400, "VALIDATION_ERROR", "Constraint violation",
                        fieldErrors, traceId, request.getRequestURI()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        String traceId = generateTraceId();
        log.warn("[{}] Access denied: {}", traceId, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildError(403, "FORBIDDEN", "Access denied",
                        null, traceId, request.getRequestURI()));
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<ApiError> handleBadCredentials(
            org.springframework.security.core.AuthenticationException ex, HttpServletRequest request) {
        String traceId = generateTraceId();
        // Use generic message to prevent user enumeration
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(buildError(401, "INVALID_CREDENTIALS", "Invalid email or password",
                        null, traceId, request.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String traceId = generateTraceId();
        return ResponseEntity.badRequest()
                .body(buildError(400, "INVALID_PARAMETER",
                        String.format("Invalid value for parameter: %s", ex.getName()),
                        null, traceId, request.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(
            Exception ex, HttpServletRequest request) {
        String traceId = generateTraceId();
        // Log the full exception internally but return safe message
        log.error("[{}] Unhandled exception at {}: {}",
                traceId, request.getRequestURI(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildError(500, "INTERNAL_ERROR",
                        "An unexpected error occurred. Please try again later.",
                        null, traceId, request.getRequestURI()));
    }

    private ApiError buildError(int status, String code, String message,
                                 Map<String, String> fieldErrors, String traceId, String path) {
        return ApiError.builder()
                .timestamp(Instant.now())
                .status(status)
                .code(code)
                .message(message)
                .fieldErrors(fieldErrors)
                .traceId(traceId)
                .path(path)
                .build();
    }

    private String generateTraceId() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
