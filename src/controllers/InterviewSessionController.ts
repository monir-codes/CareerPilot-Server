import { Request, Response, NextFunction } from 'express';
import { interviewsessionService } from '../services/InterviewSessionService';
import { sendSuccess } from '../utils/response';

export const getInterviewSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await interviewsessionService.getInterviewSessionById(req.params.id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};
