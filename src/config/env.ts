import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1, "MongoDB URI is required"),
  CLIENT_URL: z.string().min(1).default('http://localhost:3000'),
  GEMINI_API_KEY: z.string().min(1, "Gemini API Key is required"),
});

export const env = envSchema.parse(process.env);
