package com.alumni.platform.booking.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BookingApiException.class)
    public ResponseEntity<ErrorResponse> handleApi(BookingApiException ex, HttpServletRequest req) {
        log.warn("API error: {} - {}", ex.getCode(), ex.getMessage());
        return build(ex.getStatus(), ex.getCode(), ex.getMessage(), req);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValid(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String,String> errs = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) errs.put(fe.getField(), fe.getDefaultMessage());
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Invalid request", req, errs);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraint(ConstraintViolationException ex, HttpServletRequest req) {
        Map<String,String> errs = new HashMap<>();
        ex.getConstraintViolations().forEach(v -> errs.put(v.getPropertyPath().toString(), v.getMessage()));
        return build(HttpStatus.BAD_REQUEST, "CONSTRAINT_VIOLATION", "Invalid data", req, errs);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleReadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "MALFORMED_REQUEST", "Invalid JSON", req);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleType(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "TYPE_MISMATCH", "Bad param: " + ex.getName(), req);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccess(AccessDeniedException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Forbidden", req);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest req) {
        log.error("Unexpected", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Unexpected error", req);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus st, String code, String msg, HttpServletRequest req) {
        return build(st, code, msg, req, null);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus st, String code, String msg, HttpServletRequest req, Map<String,String> det) {
        ErrorResponse er = ErrorResponse.builder()
            .timestamp(Instant.now()).status(st.value()).error(st.getReasonPhrase())
            .code(code).message(msg).path(req.getRequestURI()).details(det).build();
        return ResponseEntity.status(st).body(er);
    }
}