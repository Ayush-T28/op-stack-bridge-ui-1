import { DepositQuery } from "../types";
import axiosBackendInstance from "../utils/axios";

export async function getDeposits(account: string): Promise<DepositQuery[]> {
    const data = (await axiosBackendInstance.get(`/deposit/${account}`)).data.data;
    return data;
}

export async function creteDeposit(
    account: string, type: 'deposit',
    subtype: 'initiate', amount: string, transactionHash: string
): Promise<{message: string, success: boolean}> {
    const data = (await axiosBackendInstance.post(`/deposit`, {
        account, type, subtype, amount, transactionHash
    })).data;
    
    return data as {message: string, success: boolean};
}
