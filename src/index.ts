import SparkMeterService from './services/SparkMeterService';

(async () => {
    try {
        const meterSerialNumber = '34534674890'; // boss replace with an actual number, thank you 
        const customerData = await SparkMeterService.fetchCustomerByMeter(meterSerialNumber);

        if (customerData) {
            console.log('Customer Data:', customerData);
        } else {
            console.log('No customer found for the given meter serial number.');
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('An error occurred:', error.message);
        } else {
            console.error('An unknown error occurred');
        }
    }
})();
