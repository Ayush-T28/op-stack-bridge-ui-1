import axios, { AxiosInstance } from 'axios';
import config from '../config';

let axiosBackendInstance: AxiosInstance = axios.create();

const loadAxiosInstances = () => {
    axiosBackendInstance = axios.create({baseURL: config.backendUrl});
};

loadAxiosInstances();

export default axiosBackendInstance;