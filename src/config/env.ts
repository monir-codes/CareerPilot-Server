import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.string().default('development'),
  MONGO_URI: z.string().default(''),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  GEMINI_API_KEY: z.string().default(''),
});

// Avoid crashing Vercel serverless functions on cold start if env vars are missing
export const env = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
};
