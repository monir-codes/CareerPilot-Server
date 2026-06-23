import { Router } from 'express';
import { getMyNotifications, markAsRead } from '../controllers/NotificationController';
import { requireAuthentication } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuthentication, getMyNotifications);
router.put('/:id/read', requireAuthentication, markAsRead);

export default router;
