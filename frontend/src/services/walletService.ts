import {
    type WalletResponse,
    type TransactionResponse,
    type AccountResponse,
    type CreateAccountRequest,
    type PaginatedResponse
} from "../types/wallet.types.ts";

import {walletApi} from "../api/axios.ts";

 export const getWalletData = async (userId: string): Promise<WalletResponse> => {
    const { data } = await walletApi.get<WalletResponse>(`/wallets/user/${userId}`);
    return data;
 };

 export const createAccount = async (walletId: string, accountData: CreateAccountRequest): Promise<AccountResponse> => {
    const { data } = await walletApi.post<AccountResponse>(`/wallets/${walletId}/accounts`, accountData);
    return data;
 }

 export const getTransactionHistory = async  (userId: string, page = 0, size = 10, type?: string, status?: string): Promise<PaginatedResponse<TransactionResponse>> => {
    let url = `/transactions/user/${userId}?page=${page}&size=${size}&sort=createdAt,desc`;
    if (type && type !== 'ALL') url += `&type=${type}`;
    if (status && status !== 'ALL') url += `&status=${status}`;
    
    const { data } = await walletApi.get<PaginatedResponse<TransactionResponse>>(url);
    return data;
 }

 export const getAllTransactionHistory = async (userId: string): Promise<TransactionResponse[]> => {
     const { data } = await walletApi.get<TransactionResponse[]>(`/transactions/user/${userId}/all`);
     return data;
 }

