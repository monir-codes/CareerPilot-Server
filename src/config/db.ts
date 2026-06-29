import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

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
    }).catch(async (error) => {
      if (env.MONGO_URI.includes('localhost') || env.MONGO_URI.includes('127.0.0.1')) {
        console.log('⚠️ Failed to connect to local MongoDB. Falling back to mongodb-memory-server...');
        try {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          const mongoServer = await MongoMemoryServer.create();
          const memoryUri = mongoServer.getUri();
          console.log(`🧠 In-Memory MongoDB started at ${memoryUri}`);
          
          // Also run seed data since it's an empty DB
          const mongooseInstance = await mongoose.connect(memoryUri, opts);
          
          // We can optionally seed it here, but server might be enough to just start without crashing
          return mongooseInstance;
        } catch (memError) {
          console.error('❌ Failed to start in-memory MongoDB:', memError);
          throw error; // throw original error
        }
      }
      throw error;
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
