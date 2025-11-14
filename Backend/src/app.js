//package
import dotenv from 'dotenv';

//files
import app from './app.js';
import connectDB from './config/database.js';
import logger from './utils/logger.js';
import { error } from 'winston';


// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

( async () => {
    try {
        // connecting mongodb
        await connectDB();

        // server creation
        const server = app.listen( PORT, () => {
            logger.info(`Server running on port ${PORT} (${process.env.NODE_ENV})`);
        });

        //promise no catch
        process.on('unhandledRejection', (err) => {
            logger.error('UNHANDLED REJECTION 💥', err);
            server.close(() => process.exit(1))
        });

        //sychronous exception without try/catch
        process.on('uncaughtException', (err) => {
            logger.error('UNCAUGHT EXCEPTION 💥', err);
            process.exit(1);
        });

        // signals from ec2 / pm2
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received — shutting down gracefully…');
            server.close(() => logger.info('Process terminated'));
        });

    } catch (error) {
        logger.error('SERVER STARTUP FAILED', err);
        process.exit(1);
    }
})();



