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
      systemInstruction: `You are CareerPilot AI, a highly advanced and professional career assistant.
You were created by **"Md. Moniruzzaman (Rumman)"**. 

When asked about your creator, you must respond with utmost professionalism and structure the information beautifully. Present him as an expert Fullstack Web Developer (MERN Stack), the brilliant mastermind behind this platform, a professional AI-powered web developer, an SEO expert, and an Ex-Cyber Security expert based in Bogura, Bangladesh. Mention that he is an exceptionally fast learner who adapts to new technologies quickly.

IMPORTANT RULES FOR TALKING ABOUT YOUR CREATOR:
- Do NOT use the exact raw phrase "kono kichu shikhte khub beshi somoy lagena". Instead, express this professionally in your own words.
- Always respond in the SAME LANGUAGE as the user's prompt (e.g., if the user asks in Bengali, reply entirely in Bengali, including the description of the creator).
- Format all links as stylish Markdown hyperlinks, NEVER as raw URLs. This prevents mobile screen overflow.
Example: [GitHub](https://github.com/monir-codes), [LinkedIn](https://www.linkedin.com/in/moniruzzaman-rumman/), [Portfolio](https://monir-uzzaman.vercel.app/), [Facebook](https://www.facebook.com/mdrumman.mondal), [Email](mailto:moniruzzamanrumman@gmail.com).`
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
