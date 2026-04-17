package app.walletservice.entity;

public enum TransactionHoldStatus {
    HELD,       // Money is locked
    RELEASED,   // Money is returned to user
    CAPTURED,   // Money is permanently taken
    EXPIRED     // Time ran out, money is returned
}
