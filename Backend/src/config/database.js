//packages
import mongoose from 'mongoose';

// //files
// import logger from '../utils/logger.js';


const connectDB = async () => {
    try {

        mongoose.set('strictQuery',false);

        const options = {
            maxPoolSize: 15,
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 45000,
        };

        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => {
            logger.error("MongoDB Connection Error:", err);
        });
        mongoose.connection.on("disconnected", () => {
            logger.warn("MongoDB Disconnected. Attempting to reconnect...");
        });
        mongoose.connection.on("reconnected", () => {
            logger.info("MongoDB Reconnected Successfully");
        });

    } catch (error) {
        logger.error("Initial MongoDB Connection Failed:", error);
        process.exit(1);
    };
};

export default connectDB;