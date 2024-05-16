import { ApiResponse, WithdrawalQuery } from "../types";
import axiosBackendInstance from "../utils/axios";

export async function getWithdrawals(account: string): Promise<WithdrawalQuery[]> {
    const data = (await axiosBackendInstance.get(`/withdrawal/${account}`)).data.data;
    return data;
}

export async function createWithdrawal(
    account: string, type: 'withdrawal',
    subtype: 'initiate', amount: string, transactionHash: string
): Promise<ApiResponse> {
    const data = (await axiosBackendInstance.post(`/withdrawal`, {
        account, type, subtype, amount, transactionHash
    })).data;
    
    return data as ApiResponse;
}


export async function updateWithdrawal(
    withdrawalId: string,
    account: string, type: 'withdrawal',
    subtype: 'prove' | 'finalize', amount: string, transactionHash: string
): Promise<{message: string, success: boolean}> {
    const data = (await axiosBackendInstance.post(`/withdrawal/${withdrawalId}`, {
        account, type, subtype, amount, transactionHash
    })).data;
    
    return data as {message: string, success: boolean};
}
