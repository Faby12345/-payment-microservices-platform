export type TransferType = 'INTERNAL' | 'EXTERNAL';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface TransferRequest {
    fromAccountId: string;
    amount: number;
    currency: string;
    type: TransferType;
    
    // Internal transfer (to a user identifier like email/username/iban)
    recipientIdentifier?: string;

    // External transfer
    recipientName?: string;
    iban?: string;
    bic?: string;

    description?: string;
}

export interface TransferResponse {
    transactionId: string;
    status: TransactionStatus;
    amount: number;
    fee: number;
    totalDeducted: number;
    currency: string;
    timestamp: string;
    message: string;
    estimatedDelivery: string;
}
