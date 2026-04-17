package app.walletservice.entity;

public enum TransactionStatus {
    PENDING,      // initiated but not yet processed
    PROCESSING,   // picked up and being executed
    COMPLETED,    // successfully settled
    FAILED,       // something went wrong, no money moved
    REVERSED,     // completed but then reversed/refunded
    CANCELLED     // cancelled before processing began
}
