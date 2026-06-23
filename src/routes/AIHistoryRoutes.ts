import { Router } from 'express';
import { getMyAIHistory } from '../controllers/AIHistoryController';
import { requireAuthentication } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuthentication, getMyAIHistory);

export default router;
