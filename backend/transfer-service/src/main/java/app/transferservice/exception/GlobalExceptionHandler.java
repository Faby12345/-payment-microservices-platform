package app.transferservice.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidTransferException.class)
    public ResponseEntity<Map<String, String>> handleInvalidTransferException(InvalidTransferException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Invalid Transfer");
        error.put("message", ex.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}
