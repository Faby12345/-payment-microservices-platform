package app.authservice.service;

import app.authservice.entity.RefreshToken;
import app.authservice.entity.User;
import app.authservice.repository.RefreshTokenRepository;
import app.authservice.config.security.JwtProperties;
import app.authservice.web.exception.TokenRefreshException;
import app.authservice.web.exception.TokenRevokedException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
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

    @Transactional
    public RefreshToken verifyExpirationAndStatus(RefreshToken token) {
        if(token.isExpired()){
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(), "Refresh token has expired. Please make a new sign-in request.");
        }

        if(token.isRevoked()){
            throw new TokenRevokedException(token.getToken(), "This session has been revoked. Please log in again.");
        }

        return token;

    }
    @Transactional
    public void deleteAllUserTokens(User user) {
        log.info("Deleting all refresh tokens for user with id: {}", user.getId());
        refreshTokenRepository.deleteByUser(user);
    }

    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Cleaning up expired refresh tokens from database");
        refreshTokenRepository.deleteByExpiryDateBefore(Instant.now());
    }
    public RefreshToken findByToken(String token){
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenRefreshException(token, "Refresh token not found"));
    }
    @Transactional
    public void deleteByToken(String tokenString) {
        refreshTokenRepository.findByToken(tokenString)
                .ifPresent(refreshTokenRepository::delete);
    }

}
