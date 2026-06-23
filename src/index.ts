process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Bypass SSL validation for 2026 clock
import fetch from 'node-fetch';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });
const customFetch = (url: any, init?: any) => fetch(url, { ...init, agent });
(global as any).fetch = customFetch;

import express from 'express';
import multer from 'multer';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';
import { setupSecurityMiddlewares } from './middlewares/security.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { setupAuthMiddleware, requireAuthentication } from './middlewares/auth.middleware';

// Controllers
import { AIController } from './controllers/AIController';
import { CareerPathController } from './controllers/CareerPathController';
import { getUser, getMyProfile, updateMyProfile, getOverview } from './controllers/UserController';
import { getMyNotifications, markAsRead } from './controllers/NotificationController';
import { getMyAIHistory } from './controllers/AIHistoryController';
import { toggleBookmark, checkBookmark } from './controllers/BookmarkController';

const app = express();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSecurityMiddlewares(app);
setupAuthMiddleware(app);

// AI Routes
app.post('/api/v1/ai/resume/analyze', requireAuthentication, upload.single('resume'), AIController.analyzeResume);
app.post('/api/v1/ai/cover-letter/generate', requireAuthentication, AIController.generateCoverLetter);
app.post('/api/v1/ai/roadmap/generate', requireAuthentication, AIController.generateRoadmap);
app.post('/api/v1/ai/interview/questions', requireAuthentication, AIController.generateInterviewQuestions);
app.get('/api/v1/ai/chat/sessions', requireAuthentication, AIController.getChatSessions);
app.get('/api/v1/ai/chat/sessions/:id', requireAuthentication, AIController.getChatSessionById);
app.post('/api/v1/ai/chat', requireAuthentication, AIController.chat);
app.post('/api/v1/ai/chat/sync', requireAuthentication, AIController.syncChatSession);

// Career Paths Routes
app.get('/api/v1/careers', CareerPathController.getAll);
app.get('/api/v1/careers/:id', CareerPathController.getById);

// User Routes
app.get('/api/v1/users/overview', requireAuthentication, getOverview);
app.get('/api/v1/users/profile', requireAuthentication, getMyProfile);
app.put('/api/v1/users/profile', requireAuthentication, updateMyProfile);
app.get('/api/v1/users/:id', getUser);

// Notification Routes
app.get('/api/v1/notifications', requireAuthentication, getMyNotifications);
app.put('/api/v1/notifications/:id/read', requireAuthentication, markAsRead);

// AI History Routes
app.get('/api/v1/ai-history', requireAuthentication, getMyAIHistory);

// Bookmark Routes
app.post('/api/v1/bookmarks/toggle', requireAuthentication, toggleBookmark);
app.get('/api/v1/bookmarks/check/:careerId', requireAuthentication, checkBookmark);

// Health Check / Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🚀 CareerPilot AI Backend Server is running successfully!',
    version: '1.0.0'
  });
});

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    logger.info("Server running on port " + env.PORT + " in " + env.NODE_ENV + " mode");
  });
};

if (require.main === module) {
  startServer();
} else {
  // Required for Vercel serverless functions
  connectDB();
}

export default app;
