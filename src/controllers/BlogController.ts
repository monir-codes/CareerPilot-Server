import { Request, Response, NextFunction } from 'express';
import { blogService } from '../services/BlogService';
import { sendSuccess } from '../utils/response';

export const getBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await blogService.getBlogById(req.params.id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};
