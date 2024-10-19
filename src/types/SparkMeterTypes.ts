export interface MeterReading {
    average_power: number;
    peak_power: number;
    min_power: number;
    timestamp: string;
}

export interface SalesAccount {
    id: string;
    name: string;
    balance: number;
    meter_reading: MeterReading;
}

export interface ApiResponse {
    status: string;
    data: SalesAccount;
}

export interface BalanceHistory {
    timestamp: string;
    account_balance: number;
}

export interface BalanceHistoryResponse {
    status: string;
    data: BalanceHistory[];
}

export type Resolution = 'hourly' | 'daily' | 'weekly' | 'monthly';