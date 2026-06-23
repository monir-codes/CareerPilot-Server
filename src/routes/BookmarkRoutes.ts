import { Router } from 'express';
import { toggleBookmark, checkBookmark } from '../controllers/BookmarkController';
import { requireAuthentication } from '../middlewares/auth.middleware';

const router = Router();

router.post('/toggle', requireAuthentication, toggleBookmark);
router.get('/check/:careerId', requireAuthentication, checkBookmark);

export default router;
