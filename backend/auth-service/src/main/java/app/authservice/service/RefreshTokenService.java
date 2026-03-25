package app.authservice.service;

import app.authservice.entity.RefreshToken;
import app.authservice.entity.User;
import app.authservice.repository.RefreshTokenRepository;
import app.authservice.security.JwtProperties;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties; // To get the refresh token expiration time

    @Transactional
    public RefreshToken createRefreshToken(User user) {
        String token = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plusMillis(jwtProperties.getRefreshToken().getExpiration());
        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .expiryDate(expiryDate)
                .revoked(false)
                .build();
        return refreshTokenRepository.save(refreshToken);
    }


}
