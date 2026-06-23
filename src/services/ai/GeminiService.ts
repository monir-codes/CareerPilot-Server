import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async generateStructuredResponse(prompt: string, retries = 2): Promise<any> {
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        }
      });
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      if (retries > 0) {
        logger.warn(`Gemini generation failed. Retrying... (${retries} left)`);
        await new Promise(res => setTimeout(res, 1000));
        return this.generateStructuredResponse(prompt, retries - 1);
      }
      logger.error('Gemini API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async chat(history: any[], newMessage: string): Promise<string> {
    try {
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      const chat = this.model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(newMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Gemini Chat Error:', error);
      throw new Error('Failed to generate chat response');
    }
  }
}

export const geminiService = new GeminiService();
