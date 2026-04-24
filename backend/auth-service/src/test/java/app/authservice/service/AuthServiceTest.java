package app.authservice.service;

import app.authservice.entity.Role;
import app.authservice.entity.User;
import app.authservice.mapper.UserMapper;
import app.authservice.repository.UserRepository;
import app.authservice.web.dto.request.UserRegisterRequestDto;
import app.authservice.web.dto.response.UserResponseDto;
import app.authservice.web.exception.EmailAlreadyExistsException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

// STATIC IMPORTS
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // <--- THIS IS MISSING
public class AuthServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserMapper userMapper;
    @Mock
    private RoleService roleService;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_ShouldSucceed_WhenDataIsValid() {
        // (Setup mocks)
        UserRegisterRequestDto dto = new UserRegisterRequestDto("John", "Doe", "john@example.com", "rawPass");
        Role userRole = new Role(1L, "USER");
        User userEntity = new User(); // Mocked entity
        User savedUser = new User();
        savedUser.setId(UUID.randomUUID());

        when(userRepository.existsByEmail(dto.email())).thenReturn(false);
        when(passwordEncoder.encode(dto.password())).thenReturn("hashedPass");
        when(roleService.findRoleByName("USER")).thenReturn(userRole);
        when(userMapper.toEntity(any(), any())).thenReturn(userEntity);
        when(userRepository.save(any())).thenReturn(savedUser);
        when(userMapper.toResponse(any())).thenReturn(new UserResponseDto(savedUser.getId(), "john@example.com", "John", "Doe", Set.of("USER"), Instant.now()));

        //  (Execute)
        UserResponseDto result = authService.register(dto);

        //  (Verify)
        assertNotNull(result);
        assertEquals(savedUser.getId(), result.id());
        verify(userRepository, times(1)).save(any());
        verify(passwordEncoder, times(1)).encode("rawPass");
    }
    @Test
    void register_ShouldThrowException_WhenDatabaseConflictOccurs() {
        UserRegisterRequestDto dto = new UserRegisterRequestDto("John", "Doe", "race@test.com", "pass");
        User mockUser = new User(); // Create a dummy user so the code doesn't crash on getRoles()

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(roleService.findRoleByName(anyString())).thenReturn(new Role());

        when(userMapper.toEntity(any(), anyString())).thenReturn(mockUser);
        // Force the DB error
        when(userRepository.save(any())).thenThrow(DataIntegrityViolationException.class);


        assertThrows(EmailAlreadyExistsException.class, () -> authService.register(dto));
    }
}
