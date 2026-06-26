import mongoose from 'mongoose';
import { env } from './env';

// Global cache for Vercel Serverless Functions to prevent multiple active connections
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    console.log('✅ Using globally cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔄 Attempting to connect to MongoDB...');
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(env.MONGO_URI, opts).then((mongooseInstance) => {
      console.log('🚀 MongoDB Connected: ' + mongooseInstance.connection.host);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    cached.promise = null;
    throw error;
  }
};
