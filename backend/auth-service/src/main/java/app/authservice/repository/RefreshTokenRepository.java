package app.authservice.repository;

import app.authservice.entity.RefreshToken;
import app.authservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;


public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    /**
     * Implemented custom querys beacuse by default, Spring Data JPA implements
     * derived delete methods by doing a SELECT query to fetch all matching
     * entities into memory, and then executing a separate DELETE statement
     * for each individual entity (the N+1 Delete Problem).
     */


    // For "Logout" or "Security Reset" logic
    @Modifying // Tells Spring this query modifies data (INSERT/UPDATE/DELETE)
    @Query("DELETE FROM RefreshToken r WHERE r.user = :user")
    void deleteByUser(@Param("user") User user);


    // A background task will eventually need to clean up expired tokens
    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.expiryDate < :now")
    void deleteByExpiryDateBefore(@Param("now") Instant now);

}
