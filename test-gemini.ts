import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });
const customFetch = (url: any, init?: any) => fetch(url, { ...init, agent });
(global as any).fetch = customFetch;

import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function run() {
  try {
    console.log('Testing gemini-2.5-flash...');
    const result = await model.generateContent('Hello, are you working?');
    console.log('Success:', result.response.text());
  } catch (err: any) {
    console.error('Error:', err.message || err);
  } finally {
    process.exit(0);
  }
}
run();
