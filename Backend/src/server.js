//package
import dotenv from 'dotenv';
import mongoose from 'mongoose';

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

        const gracefulShutdown = async () => {
            logger.info('🔻 Gracefully shutting down...');
            server.close(async () => {
                await mongoose.connection.close();
                logger.info('MongoDB disconnected');
                process.exit(0);
            });
        };

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            logger.error('UNHANDLED REJECTION 💥', err);
            gracefulShutdown();
        });

        //sychronous exception without try/catch
        process.on('uncaughtException', (err) => {
            logger.error('UNCAUGHT EXCEPTION 💥', err);
            process.exit(1);
        });

        // signals from ec2 / pm2 - shutdown gracefully
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received — shutting down gracefully…');
            gracefulShutdown();
        });

        // server exit using ctr+c development
        process.on('SIGINT', () => {
            logger.info('SIGINT received — shutting down…');
            gracefulShutdown();
        });


    } catch (error) {
        logger.error('SERVER STARTUP FAILED', err);
        process.exit(1);
    }
})();