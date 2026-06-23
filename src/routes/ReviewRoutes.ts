import { Router } from 'express';
import { getReview } from '../controllers/ReviewController';

const router = Router();

router.get('/:id', getReview);

export default router;
