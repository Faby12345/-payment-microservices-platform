package app.authservice.web.controller;

import app.authservice.service.AuthService;
import app.authservice.web.dto.request.UserLoginRequestDto;
import app.authservice.web.dto.request.UserRegisterRequestDto;
import app.authservice.web.dto.response.AuthSuccessResponse;
import app.authservice.web.dto.response.TokenResponseDto;
import app.authservice.web.dto.response.UserResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService){
        this.authService = authService;
    }

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
                .path("/api/v1/auth/refresh") // The browser will ONLY send this cookie to your refresh endpoint, nowhere else.
                .maxAge(7 * 24 * 60 * 60) // 7 days in seconds
                .sameSite("Strict") // Protects against CSRF
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

}
