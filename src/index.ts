import SparkMeterService from './services/SparkMeterService';
import Logger from './utils/Logger';

async function main() {
    try {
        // This Fetches customer by meter
        const meterSerialNumber = '34534674890';
        const customerData = await SparkMeterService.fetchCustomerByMeter(meterSerialNumber);

        if (customerData) {
            Logger.info('Customer Data:', customerData);
        } else {
            Logger.warn('No customer found for the given meter serial number.');
        }

        // This FetchES balance history
        const customerId = 9;
        const startTime = new Date('2024-01-01');
        const endTime = new Date('2024-01-07');

        const balanceHistory = await SparkMeterService.fetchCustomerBalanceHistory(
            customerId,
            startTime,
            endTime,
            'daily'
        );

        if (balanceHistory) {
            Logger.info('Balance History:', balanceHistory);
        }

        // This Get latest balance
        const latestBalance = await SparkMeterService.getLatestBalance(
            customerId,
            startTime,
            endTime
        );

        if (latestBalance) {
            Logger.info('Latest Balance:', latestBalance);
        }

    } catch (error) {
        if (error instanceof Error) {
            Logger.error('An error occurred:', error.message);
        } else {
            Logger.error('An unknown error occurred');
        }
    }
}

main().catch(error => {
    Logger.error('Unhandled error in main:', error);
    process.exit(1);
});
