import { Request, Response, NextFunction } from 'express';
import { resumeanalysisService } from '../services/ResumeAnalysisService';
import { sendSuccess } from '../utils/response';

export const getResumeAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resumeanalysisService.getResumeAnalysisById(req.params.id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};
