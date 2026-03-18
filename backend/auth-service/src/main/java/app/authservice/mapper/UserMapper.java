package app.authservice.mapper;

import app.authservice.entity.User;
import app.authservice.web.dto.request.UserRegisterRequestDto;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Component
public class UserMapper {
    public User toEntity(UserRegisterRequestDto dto, String encodedPassword) {
        return User.builder()
                .firstName(dto.firstName())
                .lastName(dto.lastName())
                .email(dto.email())
                .passwordHash(encodedPassword)
                .enabled(true)
                .emailVerified(false)
                .build();
    }
}
