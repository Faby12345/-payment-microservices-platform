package app.authservice.web.exception;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// The @ResponseStatus tells Spring: "If this exception is thrown and not caught,
// automatically return an HTTP 401 Unauthorized to the client."
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class TokenRevokedException extends RuntimeException{
    public TokenRevokedException(String message) {
        super(message);
    }
    public TokenRevokedException(String token, String message) {
        // We pass a formatted message to the superclass so it shows up neatly in the server logs
        super(String.format("Token [%s] is invalid: %s", token, message));
    }
}
