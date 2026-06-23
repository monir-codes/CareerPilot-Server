import { Router } from 'express';
import { getInterviewSession } from '../controllers/InterviewSessionController';

const router = Router();

router.get('/:id', getInterviewSession);

export default router;
