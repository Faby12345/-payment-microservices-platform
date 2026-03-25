package app.authservice.web.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a refresh token is expired or not found in the database.
 * Mapped to 403 Forbidden by the GlobalExceptionHandler.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class TokenRefreshException extends RuntimeException{
    public TokenRefreshException(String token, String message) {
        super(String.format("Refresh token [%s] rejection: %s", token, message));
    }

    public TokenRefreshException(String message) {
        super(message);
    }
}
