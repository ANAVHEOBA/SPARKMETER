import axios, { AxiosInstance } from 'axios';
import config from '../config';
import { ApiResponse, SalesAccount } from '../types/SparkMeterTypes';
import { UnauthorizedError, NotFoundError, ApiError } from '../utils/Errors';
import Logger from '../utils/Logger';

class SparkMeterService {
    private axiosInstance: AxiosInstance;
    private baseUrl: string;
    private authToken: string;

    constructor() {
        this.baseUrl = config.SPARKMETER_API_URL;
        this.authToken = config.SPARKMETER_API_TOKEN;

        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': this.authToken,
            },
        });

        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                Logger.error('API Error:', error.response?.status, error.message);
                return Promise.reject(error);
            }
        );
    }

    public async fetchCustomerByMeter(meterSerialNumber: string): Promise<SalesAccount | null> {
        try {
            const response = await this.axiosInstance.get<ApiResponse>('/sales-accounts', {
                params: {
                    meter_serial_number: meterSerialNumber,
                    include_reading: true,
                },
            });

            if (response.status === 200 && response.data.status === 'success') {
                return response.data.data;
            }

            Logger.error('Unexpected response structure:', response.data);
            return null;
        } catch (error: any) {
            this.handleError(error);
            return null;
        }
    }

    private handleError(error: any) {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    throw new UnauthorizedError('Authentication failed. Please check your API token.');
                case 404:
                    throw new NotFoundError('Sales account not found for the provided meter serial number.');
                default:
                    throw new ApiError(`API Error: ${error.response.status} - ${error.message}`);
            }
        } else {
            Logger.error('Network or unknown error:', error.message);
            throw new ApiError('Network or unknown error occurred');
        }
    }
}

export default new SparkMeterService();
