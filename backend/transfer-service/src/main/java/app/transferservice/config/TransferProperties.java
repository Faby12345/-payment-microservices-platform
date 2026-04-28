package app.transferservice.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import java.math.BigDecimal;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.transfer.fees")
public class TransferProperties {
    /**
     * Fee percentage for internal (Friend) transfers. e.g. 0.01 for 1%
     */
    private BigDecimal internal = new BigDecimal("0.01");

    /**
     * Fee percentage for external (IBAN) transfers. e.g. 0.025 for 2.5%
     */
    private BigDecimal external = new BigDecimal("0.025");
}
