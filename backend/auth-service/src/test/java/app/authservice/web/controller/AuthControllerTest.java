package app.authservice.web.controller;

// Domain and Service Imports
import app.authservice.security.JwtProperties;
import app.authservice.security.JwtService;
import app.authservice.security.SecurityConfig;
import app.authservice.service.AuthService;
import app.authservice.web.dto.response.UserResponseDto;

// JUnit and Mockito
import app.authservice.web.exception.EmailAlreadyExistsException;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

// Spring Test Framework
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean; // New package!
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;


import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class) // security rules active
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService; // Mock the dependency
    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private JwtProperties jwtProperties;

    @Test
    void register_ShouldReturnCreated_WhenDataIsValid() throws Exception {
        // Define what the mock service returns
        UserResponseDto response = new UserResponseDto(UUID.randomUUID(), "test@bank.com", "Alex", "Doe", Set.of("USER"), Instant.now());
        given(authService.register(any())).willReturn(response);

        //  Act & Assert: Perform the POST and check the outcome
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {
                        "email": "test@bank.com",
                        "password": "StrongPassword123!",
                        "firstName": "Alex",
                        "lastName": "Doe"
                    }
                """))
                .andExpect(status().isCreated()) // Verify 201
                .andExpect(jsonPath("$.email").value("test@bank.com"))
                .andExpect(jsonPath("$.id").exists());
    }
    @Test
    void register_ShouldReturnBadRequest_WhenEmailIsInvalid() throws Exception {
        // 1. Act
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {
                    "email": "invalid-email-no-at-sign",
                    "password": "StrongPassword123!",
                    "firstName": "Alex",
                    "lastName": "Doe"
                }
            """))
                // 2. Assert
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation Failed"));

        // Ensure the service was NEVER called
        verifyNoInteractions(authService);
    }
    @Test
    void register_ShouldReturnBadRequest_WhenPasswordIsInvalid() throws Exception {
        //  Act
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {
                    "email": "invalid-email-no-at-sign",
                    "password": "Stro!",
                    "firstName": "Alex",
                    "lastName": "Doe"
                }
            """))
                // Assert
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation Failed"));

        // Verification: Ensure the service was NEVER called
        verifyNoInteractions(authService);
    }

    @Test
    void register_ShouldReturnConflict_WhenEmailAlreadyExists() throws Exception {
        given(authService.register(any()))
                .willThrow(new EmailAlreadyExistsException("Email is already taken"));

        // Act
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {
                    "email": "existing@bank.com",
                    "password": "StrongPassword123!",
                    "firstName": "Alex",
                    "lastName": "Doe"
                }
            """))
                // Assert: Expect 409 Conflict (GlobalExceptionHandler)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Email is already taken"));
    }
}
