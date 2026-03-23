package app.authservice.repository;

import app.authservice.entity.RefreshToken;
import app.authservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    // For "Logout" or "Security Reset" logic
    void deleteByUser(User user);

    // A background task will eventually need to clean up expired tokens
    void deleteByExpiryDateBefore(Instant now);
}
