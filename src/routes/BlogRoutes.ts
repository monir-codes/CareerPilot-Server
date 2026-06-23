import { Router } from 'express';
import { getBlog } from '../controllers/BlogController';

const router = Router();

router.get('/:id', getBlog);

export default router;
