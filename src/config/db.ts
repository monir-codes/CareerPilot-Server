import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export const connectDB = async () => {
  try {
    logger.info("Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(env.MONGO_URI, {
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 5000 // fail fast if hanging
    });
    logger.info("MongoDB Connected: " + conn.connection.host);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
