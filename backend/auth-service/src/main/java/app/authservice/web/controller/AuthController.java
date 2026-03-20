package app.authservice.web.controller;

import app.authservice.service.AuthService;
import app.authservice.web.dto.request.UserRegisterRequestDto;
import app.authservice.web.dto.response.UserResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

}
