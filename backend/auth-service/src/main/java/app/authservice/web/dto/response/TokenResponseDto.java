package app.authservice.web.dto.response;

public record TokenResponseDto(
        String accessToken,
        String refreshToken
) {
}
