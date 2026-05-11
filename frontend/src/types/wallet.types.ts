
export interface AccountResponse {
    id: string;
    iban: string;
    currency: string;
    balance: number;
    availableBalance: number;
}

export interface CreateAccountRequest {
    currency: string;
}

export interface WalletResponse {
    id: string;
    userId: string;
    status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
    accounts: AccountResponse[];
}

export interface TransactionResponse {
    id: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'EXCHANGE' | 'FEE';
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    sourceCurrency: string;
    sourceAmount: number;
    destinationCurrency: string;
    destinationAmount: number;
    description: string;
    reference: string;
    createdAt: string; // ISO Date String
}
