package app.authservice.web.dto;

import java.time.Instant;
import java.util.List;

public record ErrorResponseDto(String message, List<String> details, Instant timeStamp) {
}
