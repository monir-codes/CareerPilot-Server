import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { AIChatSession } from '../models/AIChatSession.model';

export const getMyAIHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkUserId = (req as any).auth?.userId;
    if (!clerkUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const chatSessions = await AIChatSession.find({ clerkUserId }).sort({ updatedAt: -1 });
    
    // Map to a generic history format
    const history = chatSessions.map(session => ({
      id: session._id,
      title: session.title,
      type: 'Chat Session',
      topic: session.topic || 'General Inquiry',
      details: session.details || 'A career-related conversation.',
      date: session.updatedAt,
      messageCount: session.messages.length
    }));

    sendSuccess(res, history);
  } catch (error) {
    next(error);
  }
};
