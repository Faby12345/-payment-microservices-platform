import type { PaginatedResponse } from './wallet.types';

export type LedgerJournalType = 'TRANSFER' | 'FEE' | 'FX' | 'DEPOSIT' | 'WITHDRAWAL' | 'REVERSAL';
export type LedgerJournalStatus = 'POSTED' | 'REVERSED';
export type LedgerEntryDirection = 'DEBIT' | 'CREDIT';
export type LedgerEntryType = 'PRINCIPAL' | 'FEE' | 'FX_CLEARING' | 'EXTERNAL_CLEARING';

export interface LedgerEntryResponse {
    id: string;
    journalId: string;
    accountRef: string;
    walletAccountId?: string | null;
    userId?: string | null;
    currency: string;
    direction: LedgerEntryDirection;
    amount: number;
    entryType: LedgerEntryType;
    createdAt: string;
    updatedAt: string;
}

export interface LedgerJournalResponse {
    id: string;
    sourceService: string;
    sourceEventId: string;
    correlationId?: string | null;
    transferId?: string | null;
    type: LedgerJournalType;
    status: LedgerJournalStatus;
    description?: string | null;
    postedAt: string;
    createdAt: string;
    updatedAt: string;
    entries: LedgerEntryResponse[];
}

export interface LedgerJournalFilters {
    userId?: string;
    walletAccountId?: string;
    transferId?: string;
    sourceEventId?: string;
    correlationId?: string;
    type?: LedgerJournalType | 'ALL';
    status?: LedgerJournalStatus | 'ALL';
    currency?: string;
    direction?: LedgerEntryDirection | 'ALL';
    entryType?: LedgerEntryType | 'ALL';
    postedFrom?: string;
    postedTo?: string;
}

export interface LedgerEntryFilters {
    journalId?: string;
    userId?: string;
    walletAccountId?: string;
    transferId?: string;
    accountRef?: string;
    currency?: string;
    direction?: LedgerEntryDirection | 'ALL';
    entryType?: LedgerEntryType | 'ALL';
    journalType?: LedgerJournalType | 'ALL';
    journalStatus?: LedgerJournalStatus | 'ALL';
    postedFrom?: string;
    postedTo?: string;
}

export type LedgerJournalPage = PaginatedResponse<LedgerJournalResponse>;
export type LedgerEntryPage = PaginatedResponse<LedgerEntryResponse>;
