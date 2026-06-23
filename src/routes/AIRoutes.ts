import { Router } from 'express';
import multer from 'multer';
import { AIController } from '../controllers/AIController';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Assuming rate limiter and auth middlewares are applied at the global /api/v1 level
router.post('/resume/analyze', upload.single('resume'), AIController.analyzeResume);
router.post('/cover-letter/generate', AIController.generateCoverLetter);
router.post('/roadmap/generate', AIController.generateRoadmap);
router.post('/interview/questions', AIController.generateInterviewQuestions);
router.get('/chat/sessions', AIController.getChatSessions);
router.get('/chat/sessions/:id', AIController.getChatSessionById);
router.post('/chat', AIController.chat);
router.post('/chat/sync', AIController.syncChatSession);

export default router;
