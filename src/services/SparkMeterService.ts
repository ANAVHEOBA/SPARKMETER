import axios, { AxiosInstance } from 'axios';
import config from '../config';
import { 
    ApiResponse, 
    SalesAccount, 
    BalanceHistory, 
    BalanceHistoryResponse, 
    Resolution 
} from '../types/SparkMeterTypes';
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
                Logger.info(`Successfully fetched customer data for meter ${meterSerialNumber}`);
                return response.data.data;
            }

            Logger.error('Unexpected response structure:', response.data);
            return null;
        } catch (error: any) {
            this.handleError(error);
            return null;
        }
    }

    public async fetchCustomerBalanceHistory(
        customerId: number,
        startTime: Date,
        endTime: Date,
        resolution: Resolution = 'daily'
    ): Promise<BalanceHistory[] | null> {
        try {
            const response = await this.axiosInstance.get<BalanceHistoryResponse>(
                `/customers/${customerId}/balances/`,
                {
                    params: {
                        start_time: startTime.toISOString(),
                        end_time: endTime.toISOString(),
                        resolution: resolution,
                    },
                }
            );

            if (response.status === 200 && response.data.status === 'success') {
                const sortedData = response.data.data.sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
                
                Logger.info(`Successfully fetched balance history for customer ${customerId}`);
                return sortedData;
            }

            Logger.error('Unexpected response structure:', response.data);
            return null;
        } catch (error: any) {
            this.handleError(error);
            return null;
        }
    }

    public async getLatestBalance(
        customerId: number,
        startTime: Date,
        endTime: Date
    ): Promise<BalanceHistory | null> {
        try {
            const balanceHistory = await this.fetchCustomerBalanceHistory(
                customerId,
                startTime,
                endTime,
                'daily'
            );

            if (balanceHistory && balanceHistory.length > 0) {
                Logger.info(`Successfully fetched latest balance for customer ${customerId}`);
                return balanceHistory[0];
            }

            Logger.warn(`No balance history found for customer ${customerId}`);
            return null;
        } catch (error) {
            Logger.error('Error fetching latest balance:', error);
            return null;
        }
    }

    private handleError(error: any) {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    throw new UnauthorizedError('Authentication failed. Please check your API token.');
                case 404:
                    throw new NotFoundError('Resource not found.');
                default:
                    throw new ApiError(`API Error: ${error.response.status} - ${error.message}`);
            }
        } else if (error.request) {
            Logger.error('No response received from the server');
            throw new ApiError('No response received from the server');
        } else {
            Logger.error('Network or unknown error:', error.message);
            throw new ApiError('Network or unknown error occurred');
        }
    }
}

export default new SparkMeterService();