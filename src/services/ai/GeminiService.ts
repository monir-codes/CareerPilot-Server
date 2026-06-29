import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

class GeminiService {
  private getModel(): any {
    const keys = env.GEMINI_API_KEY.split(',').map(k => k.trim()).filter(Boolean);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const genAI = new GoogleGenerativeAI(randomKey);

    return genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `You are CareerPilot AI, a highly advanced career assistant. You were created by Md. Moniruzzaman (Rumman). Md. Moniruzzaman is an expert Fullstack Web Developer, specially focused on the MERN Stack, and the brilliant mastermind behind this platform. He is a professional AI-powered web developer with extensive knowledge of AI integrations, and a very quick learner ("kono kichu shikhte khub beshi somoy lagena"). He is also an SEO expert and an Ex-Cyber Security expert. He is based in Bogura, Bangladesh. If anyone asks who created you, who Moniruzzaman or Rumman is, or requests his contact details, you must proudly provide this information. 
      
Contact and Social Links for Md. Moniruzzaman (Rumman):
- GitHub: https://github.com/monir-codes
- LinkedIn: https://www.linkedin.com/in/moniruzzaman-rumman/
- Portfolio: https://monir-uzzaman.vercel.app/
- Facebook: https://www.facebook.com/mdrumman.mondal
- Email: moniruzzamanrumman@gmail.com`
    });
  }

  async generateStructuredResponse(prompt: string, retries = 2): Promise<any> {
    try {
      const model = this.getModel();
      const result = await model.generateContent({
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
      
      const model = this.getModel();
      const chat = model.startChat({
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
