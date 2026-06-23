import { Request, Response, NextFunction } from 'express';
import { Bookmark } from '../models/Bookmark.model';
import { sendSuccess } from '../utils/response';

export const toggleBookmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { careerId } = req.body;
    
    const existing = await Bookmark.findOne({ clerkUserId: clerkId, careerId });
    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return sendSuccess(res, { bookmarked: false }, 'Removed bookmark');
    } else {
      await Bookmark.create({ clerkUserId: clerkId, careerId });
      return sendSuccess(res, { bookmarked: true }, 'Added bookmark');
    }
  } catch (error) {
    next(error);
  }
};

export const checkBookmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { careerId } = req.params;
    
    const existing = await Bookmark.findOne({ clerkUserId: clerkId, careerId });
    return sendSuccess(res, { bookmarked: !!existing });
  } catch (error) {
    next(error);
  }
};
