package app.authservice.repository;

import app.authservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import javax.swing.text.StyledEditorKit;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    Boolean existsByEmailAndPasswordHash(String email, String passwordHash);
    Boolean existsByEmail(String email);
}
