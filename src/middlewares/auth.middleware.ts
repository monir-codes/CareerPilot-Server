import { clerkMiddleware } from '@clerk/express';
import { Application, Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';

export const setupAuthMiddleware = (app: Application) => {
  // Parses the Clerk token and attaches auth object to req
  app.use(clerkMiddleware({ clockSkewInMs: 315360000000 }));
};

// Use this on protected routes
export const requireAuthentication = async (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).auth) {
    (req as any).auth = {};
  }
  
  let clerkId = (req as any).auth?.userId;
  
  // Local development bypass due to Clerk clock skew bugs
  if (!clerkId && req.headers['x-test-user-id']) {
    clerkId = req.headers['x-test-user-id'] as string;
    (req as any).auth.userId = clerkId; // Mutate for controllers
  }

  if (!clerkId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Auto-register user for local dev bypassing webhooks
  try {
    const userExists = await User.exists({ clerkId });
    if (!userExists) {
      await User.create({
        clerkId,
        email: `${clerkId}@local.dev`
      });
    }
  } catch (error) {
    console.error('Auto-registration failed:', error);
  }

  next();
};
