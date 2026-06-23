import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { Notification } from '../models/Notification.model';
import { User } from '../models/User.model';

export const getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const notifications = await Notification.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ user: user._id, isRead: false });

    sendSuccess(res, { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: user._id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    
    sendSuccess(res, notification);
  } catch (error) {
    next(error);
  }
};
