package app.authservice.web.dto.response;

/**
 * NOTE: The Refresh Token is omitted here as it is sent via an HttpOnly cookie.
 */
public record AuthSuccessResponse(
        String accessToken
) {
}
