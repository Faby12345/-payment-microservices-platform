import {
    type WalletResponse,
    type TransactionResponse,
    type AccountResponse,
    type CreateAccountRequest
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

 export const getTransactionHistory = async  (userId: string): Promise<TransactionResponse[]> => {
    const { data } = await walletApi.get<TransactionResponse[]>(`/transactions/user/${userId}`);
    return data;
 }

