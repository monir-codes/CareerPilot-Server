require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

model.generateContent({
  contents: [{ role: 'user', parts: [{ text: 'Reply in JSON: {"success": true}' }] }],
  generationConfig: { responseMimeType: 'application/json' }
}).then(r => console.log('OK', r.response.text())).catch(e => console.error('FAILED', e.message));
