import { api } from '../api/axios';
import type {
    LedgerEntryFilters,
    LedgerEntryPage,
    LedgerJournalFilters,
    LedgerJournalPage,
    LedgerJournalResponse
} from '../types/ledger.types';

const cleanParams = (params: Record<string, unknown>) => {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== '' && value !== 'ALL')
    );
};

export const ledgerService = {
    getJournals: async (
        filters: LedgerJournalFilters,
        page = 0,
        size = 20
    ): Promise<LedgerJournalPage> => {
        const { data } = await api.get<LedgerJournalPage>('/ledger/journals', {
            params: cleanParams({ ...filters, page, size, sort: 'postedAt,desc' })
        });
        return data;
    },

    getJournal: async (journalId: string): Promise<LedgerJournalResponse> => {
        const { data } = await api.get<LedgerJournalResponse>(`/ledger/journals/${journalId}`);
        return data;
    },

    getEntries: async (
        filters: LedgerEntryFilters,
        page = 0,
        size = 50
    ): Promise<LedgerEntryPage> => {
        const { data } = await api.get<LedgerEntryPage>('/ledger/entries', {
            params: cleanParams({ ...filters, page, size, sort: 'createdAt,desc' })
        });
        return data;
    }
};
