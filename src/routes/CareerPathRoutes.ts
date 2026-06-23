import { Router } from 'express';
import { CareerPathController } from '../controllers/CareerPathController';

const router = Router();

// Public routes for exploration
router.get('/', CareerPathController.getAll);
router.get('/:id', CareerPathController.getById);

export default router;
