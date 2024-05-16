import { ActivityQuery } from "../types";
import axiosBackendInstance from "../utils/axios";

export async function getAcitivity(transactionId: string): Promise<ActivityQuery[]> {
    const data = (await axiosBackendInstance.get(`/activity/${transactionId}`)).data.data;
    return data;
}

