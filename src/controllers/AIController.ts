import { AIChatSession } from '../models/AIChatSession.model';
import { ResumeAnalysis } from '../models/ResumeAnalysis.model';
import { Request, Response } from 'express';
import { geminiService } from '../services/ai/GeminiService';
import { PromptTemplates } from '../services/ai/PromptTemplates';
import { sendSuccess } from '../utils/response';
const pdfParse = require('pdf-parse');

export class AIController {
  
  static async analyzeResume(req: Request, res: Response) {
    if (!req.file) throw new Error('No resume file uploaded');
    
    // Extract Text
    const data = await pdfParse(req.file.buffer);
    const resumeText = data.text;

    const prompt = PromptTemplates.resumeAnalyzer(resumeText.substring(0, 5000)); // Limit tokens
    const analysis = await geminiService.generateStructuredResponse(prompt);
    
    try {
      const clerkUserId = (req as any).auth?.userId;
      if (clerkUserId && analysis.score) {
        await ResumeAnalysis.create({
          clerkUserId,
          score: analysis.score
        });
      }
    } catch (e) {
      console.error("Failed to save resume score to DB", e);
    }
    
    sendSuccess(res, analysis, 'Resume analyzed successfully', 200);
  }

  static async generateCoverLetter(req: Request, res: Response) {
    const prompt = PromptTemplates.coverLetterGenerator(req.body);
    const result = await geminiService.generateStructuredResponse(prompt);
    sendSuccess(res, result, 'Cover letter generated', 200);
  }

  static async generateRoadmap(req: Request, res: Response) {
    const prompt = PromptTemplates.careerRoadmap(req.body);
    const result = await geminiService.generateStructuredResponse(prompt);
    sendSuccess(res, result, 'Roadmap generated', 200);
  }

  static async generateInterviewQuestions(req: Request, res: Response) {
    const { role } = req.body;
    const prompt = PromptTemplates.interviewAssistant(role);
    const result = await geminiService.generateStructuredResponse(prompt);
    sendSuccess(res, result, 'Questions generated', 200);
  }

  
  static async getChatSessions(req: Request, res: Response) {
    try {
      const clerkUserId = (req as any).auth?.userId;
      if (!clerkUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const sessions = await AIChatSession.find({ clerkUserId }).select('title createdAt updatedAt').sort({ updatedAt: -1 });
      sendSuccess(res, sessions, 'Sessions fetched', 200);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
    }
  }

  static async getChatSessionById(req: Request, res: Response) {
    try {
      const clerkUserId = (req as any).auth?.userId;
      const { id } = req.params;
      
      const session = await AIChatSession.findOne({ _id: id, clerkUserId });
      if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
      
      sendSuccess(res, session, 'Session fetched', 200);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch session' });
    }
  }

  static async chat(req: Request, res: Response) {
    try {
      const clerkUserId = (req as any).auth?.userId;
      if (!clerkUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { message, sessionId } = req.body;
      
      let session;
      let isNewSession = false;
      
      if (sessionId) {
        session = await AIChatSession.findOne({ _id: sessionId, clerkUserId });
      }
      
      if (!session) {
        // Create new session
        const title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
        session = new AIChatSession({ 
          clerkUserId, 
          title, 
          topic: 'General Inquiry',
          details: 'A career-related conversation.',
          messages: [] 
        });
        isNewSession = true;
      }

      // Add user message
      session.messages.push({ role: 'user', content: message, timestamp: new Date() });
      
      // Hit Gemini
      const responseText = await geminiService.chat(session.messages.slice(0, -1), message);
      
      // Add AI response
      session.messages.push({ role: 'ai', content: responseText, timestamp: new Date() });
      await session.save();

      // Generate topic and details asynchronously for new sessions
      if (isNewSession) {
        geminiService.generateStructuredResponse(`Analyze this query: "${message}". Respond with JSON containing "topic" (2-4 words) and "details" (1 sentence summary).`)
          .then(async (summary: any) => {
             await AIChatSession.updateOne(
               { _id: session._id }, 
               { topic: summary.topic, details: summary.details }
             );
          }).catch((err: any) => console.error('Topic generation failed', err));
      }

      sendSuccess(res, { text: responseText, sessionId: session._id }, 'Chat response generated', 200);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Chat generation failed' });
    }
  }

  static async syncChatSession(req: Request, res: Response) {
    try {
      const clerkUserId = (req as any).auth?.userId;
      if (!clerkUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { messages, sessionId, title } = req.body;
      
      let session;
      if (sessionId) {
        session = await AIChatSession.findOne({ _id: sessionId, clerkUserId });
      }
      
      if (!session) {
        session = new AIChatSession({ 
          clerkUserId, 
          title: title || (messages.length > 0 ? messages[0].content.substring(0, 30) : 'New Chat'), 
          topic: 'Direct Chat Sync',
          details: 'Direct chat with Gemini API.',
          messages: [] 
        });
      }

      // Overwrite or append messages
      session.messages = messages.map((m: any) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp || new Date()
      }));

      await session.save();

      sendSuccess(res, { sessionId: session._id }, 'Chat synced', 200);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Sync failed' });
    }
  }

}
