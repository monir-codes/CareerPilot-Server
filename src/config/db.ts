import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    logger.info("Using existing MongoDB connection");
    return;
  }
  try {
    logger.info("Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(env.MONGO_URI, {
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 5000 // fail fast if hanging
    });
    isConnected = !!conn.connections[0].readyState;
    logger.info("MongoDB Connected: " + conn.connection.host);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    if (require.main === module) process.exit(1);
  }
};
