import { transferApi } from '../api/axios';

export interface ExchangeRateResponse {
    baseCurrency: string;
    targetCurrency: string;
    rate: number;
    lastUpdated: string;
}

export interface ExchangeRateHistoryResponse {
    baseCurrency: string;
    targetCurrency: string;
    rate: number;
    rateDate: string;
}

export const marketService = {
    getCurrentRates: async (): Promise<ExchangeRateResponse[]> => {
        // Using transferApi which points to http://localhost:8082 or similar
        const response = await transferApi.get<ExchangeRateResponse[]>('/api/v1/exchange-rates/current');
        return response.data;
    },

    getHistoryByDate: async (date: string): Promise<ExchangeRateHistoryResponse[]> => {
        const response = await transferApi.get<ExchangeRateHistoryResponse[]>(`/api/v1/exchange-rates/history/${date}`);
        return response.data;
    }
};
