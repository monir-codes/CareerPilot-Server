import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/UserService';
import { sendSuccess } from '../utils/response';
import { User } from '../models/User.model';
import { AIChatSession } from '../models/AIChatSession.model';
import { ResumeAnalysis } from '../models/ResumeAnalysis.model';

export const getOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    // Total Chats
    const totalChats = await AIChatSession.countDocuments({ clerkUserId: clerkId });
    
    // Total Messages
    const sessions = await AIChatSession.find({ clerkUserId: clerkId }).select('messages');
    let totalMessages = 0;
    sessions.forEach(s => {
      totalMessages += s.messages.length;
    });

    // Resume Stats
    const latestResume = await ResumeAnalysis.findOne({ clerkUserId: clerkId }).sort({ createdAt: -1 });
    const resumeHistory = await ResumeAnalysis.find({ clerkUserId: clerkId }).sort({ createdAt: 1 }).limit(10);
    
    // Saved Careers
    const { Bookmark } = await import('../models/Bookmark.model');
    const savedCareers = await Bookmark.countDocuments({ clerkUserId: clerkId, isDeleted: false });

    const chartData = resumeHistory.map(r => ({
      name: new Date(r.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
      score: r.score
    }));

    if (chartData.length === 0) {
      chartData.push({ name: 'No Data', score: 0 });
    }

    sendSuccess(res, {
      totalChats,
      totalMessages,
      resumeScore: latestResume ? latestResume.score : 0,
      savedCareers,
      chartData
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.getUserById(req.params.id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { fullName, title, bio } = req.body;
    const user = await User.findOneAndUpdate(
      { clerkId },
      { fullName, title, bio },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};
