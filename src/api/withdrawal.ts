import { ApiResponse, WithdrawalQuery } from "../types";
import axiosBackendInstance from "../utils/axios";
type WithdrawalQueryAndStatus= WithdrawalQuery & { status: string, subtype: string}

export async function getWithdrawals(account: string): Promise<WithdrawalQueryAndStatus[]> {
    const data = (await axiosBackendInstance.get(`/withdrawal/${account}`)).data.data;
    return data;
}

export async function createWithdrawal(
    account: string, type: 'withdrawal',
    subtype: 'initiate', amount: string, transactionHash: string
): Promise<ApiResponse> {

    console.log({account, type, subtype, amount, transactionHash});
    const data = (await axiosBackendInstance.post(`/withdrawal`, {
        account, type, subtype, amount, transactionHash
    })).data;
    
    return data as ApiResponse;
}


export async function updateWithdrawal(
    withdrawalId: string,
    subtype: 'prove' | 'finalize',  transactionHash: string
): Promise<{message: string, success: boolean}> {
    const data = (await axiosBackendInstance.post(`/withdrawal/${withdrawalId}`, {
        subtype, transactionHash
    })).data;
    
    return data as {message: string, success: boolean};
}
