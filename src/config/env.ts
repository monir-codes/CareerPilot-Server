import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly resolve the .env file in the backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1, 'MongoDB URI is required in the .env file'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  GEMINI_API_KEY: z.string().min(1, 'Gemini API Key is required in the .env file'),
});

export const env = envSchema.parse(process.env);
