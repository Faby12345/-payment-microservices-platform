import {
    type WalletResponse,
    type TransactionResponse
} from "../types/wallet.types.ts";

import {walletApi} from "../api/axios.ts";

 export const getWalletData = async (userId: string): Promise<WalletResponse> => {
    const { data } = await walletApi.get<WalletResponse>(`/wallets/user/${userId}`);
    return data;
 };

 export const getTransactionHistory = async  (userId: string): Promise<TransactionResponse[]> => {
    const { data } = await walletApi.get<TransactionResponse[]>(`/transactions/user/${userId}`);
    return data;
 }

 export const initateTransfer = async (transferData: any) => {
     try {
         const response = await walletApi.post<transferData>()
     }
 }