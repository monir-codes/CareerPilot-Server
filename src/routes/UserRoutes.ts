import { Router } from 'express';
import { getUser, getMyProfile, updateMyProfile, getOverview } from '../controllers/UserController';
import { requireAuthentication } from '../middlewares/auth.middleware';

const router = Router();

router.get('/overview', requireAuthentication, getOverview);
router.get('/profile', requireAuthentication, getMyProfile);
router.put('/profile', requireAuthentication, updateMyProfile);
router.get('/:id', getUser);

export default router;
