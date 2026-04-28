package app.transferservice.model;

import app.transferservice.model.enums.TransferType;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "beneficiaries")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Beneficiary extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID ownerId; // The user who saved this contact

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransferType type;

    // For INTERNAL
    private String recipientIdentifier;

    // For EXTERNAL (IBAN)
    private String recipientName;
    private String iban;
    private String bic;
}
