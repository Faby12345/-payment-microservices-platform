package app.authservice.web.exception;

import app.authservice.web.dto.error.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j // This provides the 'log' variable automatically
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailExists(EmailAlreadyExistsException ex) {
        log.warn("Registration failed: Email already exists - {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(ex.getMessage(), List.of("The email is already registered"), Instant.now()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {

        log.warn("Validation failed for request: {}", ex.getBindingResult().getObjectName());
        List<String> errors = ex.getBindingResult().getFieldErrors()
                .stream().map(FieldError::getDefaultMessage).toList();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("Validation Failed", errors, Instant.now()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralExceptions(Exception ex) {
        // 'error' level and include the exception object 'ex'
        log.error("UNEXPECTED SYSTEM ERROR: ", ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(
                        "An internal error occurred",
                        List.of("Reference ID: " + UUID.randomUUID()), //give the user a ref ID
                        Instant.now()
                ));
    }

    @ExceptionHandler(TokenRevokedException.class)
    public ResponseEntity<ErrorResponse> handleTokenRevoked(TokenRevokedException ex) {
        log.warn("Security Event: Attempted use of revoked token - {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED) // 401
                .body(new ErrorResponse(
                        "Authentication Failed",
                        List.of(ex.getMessage()),
                        Instant.now()
                ));
    }

    @ExceptionHandler(TokenRefreshException.class) // Assuming you created this one for expired tokens
    public ResponseEntity<ErrorResponse> handleTokenRefresh(TokenRefreshException ex) {
        log.info("Token refresh failed: {}", ex.getMessage());

        // 403 Forbidden is often used here to tell the frontend "You must fully re-authenticate"
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(
                        "Session Expired",
                        List.of(ex.getMessage()),
                        Instant.now()
                ));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(
                        "Resource Not Found",
                        List.of(ex.getMessage()),
                        Instant.now()
                ));
    }

}
