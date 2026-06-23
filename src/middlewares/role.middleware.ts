import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../models/User.model';
import { sendError } from '../utils/response';

export const requireRole = (role: UserRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = (req as any).auth;
      if (!auth || !auth.userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const user = await User.findOne({ clerkId: auth.userId });
      if (!user) {
        return sendError(res, 'User not found in database', 404);
      }

      if (user.role !== role && user.role !== UserRole.ADMIN) {
        return sendError(res, 'Forbidden: Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
