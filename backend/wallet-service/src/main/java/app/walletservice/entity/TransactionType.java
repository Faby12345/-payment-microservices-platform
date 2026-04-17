package app.walletservice.entity;

public enum TransactionType {
    DEPOSIT,      // money coming in from outside (bank transfer in, top-up)
    WITHDRAWAL,   // money going out to outside (bank transfer out)
    TRANSFER,     // internal move between wallets within the platform
    EXCHANGE,     // currency conversion (EUR -> USD within same wallet owner)
    FEE           // platform charges a fee to the user
}
