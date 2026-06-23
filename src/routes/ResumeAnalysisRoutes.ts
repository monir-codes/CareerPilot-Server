import { Router } from 'express';
import { getResumeAnalysis } from '../controllers/ResumeAnalysisController';

const router = Router();

router.get('/:id', getResumeAnalysis);

export default router;
