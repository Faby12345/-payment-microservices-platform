package app.authservice.web.controller;

import app.authservice.mapper.UserMapper;
import app.authservice.service.AuthService;
import app.authservice.web.dto.request.UserLoginRequestDto;
import app.authservice.web.dto.request.UserRegisterRequestDto;
import app.authservice.web.dto.response.AuthSuccessResponse;
import app.authservice.web.dto.response.TokenResponseDto;
import app.authservice.web.dto.response.UserResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
@Slf4j
public class AuthController {
    private final AuthService authService;
    private final UserMapper userMapper;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@RequestBody @Valid UserRegisterRequestDto dto){

        UserResponseDto response = authService.register(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    @PostMapping("/login")
    public ResponseEntity<AuthSuccessResponse> login(@RequestBody @Valid UserLoginRequestDto dto){

        TokenResponseDto tokenData = authService.login(dto);


        ResponseCookie springCookie = ResponseCookie.from("refresh_token", tokenData.refreshToken())
                .httpOnly(true)
                .secure(false) // (IF IS SET TO TRUE) Ensures it's only sent over HTTPS(this might need to disable this for localhost testing)
                .path("/") // Allow the cookie for any endpoint on the server
                .maxAge(7 * 24 * 60 * 60) // 7 days in seconds
                .sameSite("Lax") // Changed from Strict for cross-origin local dev
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, springCookie.toString())
                .body(new AuthSuccessResponse(tokenData.accessToken()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthSuccessResponse> refresh(
            @CookieValue(name = "refresh_token") String refreshToken)
    {
        TokenResponseDto tokenData = authService.generateAccessToken(refreshToken);
        return ResponseEntity.ok()
                .body(new AuthSuccessResponse(tokenData.accessToken()));

    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = "refresh_token") String refreshToken)
    {
        authService.logout(refreshToken);

        ResponseCookie deleteCookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(false) // Set to false if testing locally without HTTPS
                .path("/")
                .maxAge(0) // tells the browser to delete it
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .build(); // .build() completes the response with no JSON body

    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> me(
            @AuthenticationPrincipal UserDetails userDetails){

        if (userDetails == null) {
            log.warn("GET /me called without authentication");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        log.info("GET /me called for user: {}", userDetails.getUsername());
        return ResponseEntity.ok()
                .body(authService.getUserProfile(userDetails.getUsername()));
    }

}
