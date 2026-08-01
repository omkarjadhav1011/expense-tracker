package com.omkar.expensetracker.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 🔴 BUSINESS LOGIC ERRORS (email exists, invalid login, etc.)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {

        log.error("Business exception: {}", ex.getMessage());

        return badRequest(ex.getMessage());
    }

    // 🔴 VALIDATION ERRORS (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();

        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        log.warn("Validation failed: {}", fieldErrors);

        Map<String, Object> body = new HashMap<>();
        body.put("message", "Validation failed");
        body.put("errors", fieldErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /**
     * 🔴 MISSING / UNCONVERTIBLE REQUEST PARAMS
     *
     * MissingServletRequestParameterException is a checked ServletException, so it
     * used to fall through to the generic handler below and answer 500. Omitting the
     * required ?type= on /api/categories is a client mistake, not a server fault.
     */
    @ExceptionHandler({
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class
    })
    public ResponseEntity<Map<String, Object>> handleBadRequestParam(Exception ex) {

        log.warn("Bad request parameter: {}", ex.getMessage());

        String message = ex instanceof MissingServletRequestParameterException missing
                ? "Required parameter '" + missing.getParameterName() + "' is missing."
                : "A request parameter has an invalid value.";

        return badRequest(message);
    }

    /**
     * 🔴 UNREADABLE REQUEST BODY (bad JSON, unknown enum value)
     *
     * This is a RuntimeException, so the handler above caught it and echoed a full
     * Jackson mapping description — leaking internal class and package names.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadableBody(
            HttpMessageNotReadableException ex) {

        log.warn("Unreadable request body: {}", ex.getMessage());

        return badRequest("Request body is malformed or contains an invalid value.");
    }

    // 🔴 FALLBACK (unexpected server errors)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {

        log.error("Unexpected error occurred", ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(messageBody("Something went wrong. Please try again later."));
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(messageBody(message));
    }

    /**
     * Built with HashMap, not Map.of, which rejects null values — any exception with
     * a null message (an unboxing NPE, a ClassCastException) made this handler throw
     * and the client got Spring's raw /error page instead of the {message} contract
     * the frontend parses.
     */
    private Map<String, Object> messageBody(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", message == null || message.isBlank()
                ? "Request could not be processed."
                : message);
        return body;
    }
}
