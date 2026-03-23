package app.authservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class JpaConfig {

    // This is a "Marker" config class.
    // It keeps the JPA Auditing engine away from  Web Tests.
}
