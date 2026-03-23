package app.authservice.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "application.security.jwt")
@Getter
@Setter
public class JwtProperties {
    private String secretKey;
    private long expiration;
    private RefreshToken refreshToken;

    @Getter
    @Setter
    public static class RefreshToken {
        private long expiration;
    }
}