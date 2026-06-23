import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/ReviewService';
import { sendSuccess } from '../utils/response';

export const getReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await reviewService.getReviewById(req.params.id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};
