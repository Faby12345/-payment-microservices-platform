package app.authservice.web.dto.error;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(String message, List<String> errors, Instant timeStamp) {
}
