package io.fleetos.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    // ----------------------------------------------------------------
    // Domain exceptions
    // ----------------------------------------------------------------

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException ex) {
        log.warn("API exception [{}]: {}", ex.getStatus(), ex.getMessage());
        return buildError(ex.getStatus(), ex.getMessage(), null);
    }

    // ----------------------------------------------------------------
    // Spring Security exceptions
    // ----------------------------------------------------------------

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return buildError(HttpStatus.FORBIDDEN, "Access denied", null);
    }

    @ExceptionHandler({BadCredentialsException.class, DisabledException.class, LockedException.class})
    public ResponseEntity<ErrorResponse> handleAuthExceptions(RuntimeException ex) {
        String msg = ex instanceof BadCredentialsException
            ? "Invalid email or password"
            : ex instanceof DisabledException
            ? "Account is disabled"
            : "Account is locked";
        return buildError(HttpStatus.UNAUTHORIZED, msg, null);
    }

    // ----------------------------------------------------------------
    // Validation errors (@Valid)
    // ----------------------------------------------------------------

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        Map<String, String> fieldErrors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                f -> f.getDefaultMessage() == null ? "Invalid value" : f.getDefaultMessage(),
                (a, b) -> a
            ));

        ErrorResponse body = ErrorResponse.builder()
            .success(false)
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Validation failed")
            .message("One or more fields have validation errors")
            .fieldErrors(fieldErrors)
            .timestamp(LocalDateTime.now().toString())
            .build();

        return ResponseEntity.badRequest().body(body);
    }

    // ----------------------------------------------------------------
    // Catch-all
    // ----------------------------------------------------------------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR,
            "An unexpected error occurred. Please try again later.", null);
    }

    // ----------------------------------------------------------------
    // Builder helper
    // ----------------------------------------------------------------

    private ResponseEntity<ErrorResponse> buildError(
            HttpStatus status, String message, Map<String, String> fieldErrors) {

        ErrorResponse body = ErrorResponse.builder()
            .success(false)
            .status(status.value())
            .error(status.getReasonPhrase())
            .message(message)
            .fieldErrors(fieldErrors)
            .timestamp(LocalDateTime.now().toString())
            .build();

        return ResponseEntity.status(status).body(body);
    }
}
