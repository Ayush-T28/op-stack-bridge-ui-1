import axiosBackendInstance from "../utils/axios";

export async function getToken(): Promise<any> {
    const data = (await axiosBackendInstance.get(`/chain/token`)).data.data;
    return data;
}