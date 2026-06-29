import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly resolve the .env file in the backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().default('mongodb://localhost:27017/careerpilot'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  GEMINI_API_KEY: z.string().default('MISSING_API_KEY'),
});

export const env = envSchema.parse(process.env);
