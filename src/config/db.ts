import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

// Vercel Serverless Function Database Caching
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    logger.info("Using existing globally cached MongoDB connection");
    return cached.conn;
  }

  if (!env.MONGO_URI) {
    logger.warn("⚠️ MONGO_URI is missing in environment variables. Database will not connect.");
    return null;
  }

  if (!cached.promise) {
    logger.info("Attempting to connect to MongoDB...");
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000 // fail fast if hanging
    };

    cached.promise = mongoose.connect(env.MONGO_URI, opts).then((mongooseInstance) => {
      logger.info("MongoDB Connected: " + mongooseInstance.connection.host);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    cached.promise = null;
    throw error;
  }
};
