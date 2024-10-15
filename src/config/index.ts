import * as dotenv from 'dotenv';
dotenv.config();

export default {
    SPARKMETER_API_URL: process.env.SPARKMETER_API_URL || '',
    SPARKMETER_API_TOKEN: process.env.SPARKMETER_API_TOKEN || '',
};
