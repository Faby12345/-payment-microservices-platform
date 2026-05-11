import {transferApi} from "../api/axios";
import {type TransferRequest, type TransferResponse} from "../types/transfer.types";

export const submitTransfer = async (transferData : TransferRequest): Promise<TransferResponse> => {
    const { data } = await transferApi.post<TransferResponse>(`/api/v1/transfers`, transferData);
    return data;
}