package app.authservice.repository;

import app.authservice.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    
    @EntityGraph(attributePaths = {"roles"})
    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"roles"})
    Optional<User> findWithRolesById(UUID id);

    Boolean existsByEmailAndPasswordHash(String email, String passwordHash);
    Boolean existsByEmail(String email);
}
