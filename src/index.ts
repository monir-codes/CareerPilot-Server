process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Bypass SSL validation for 2026 clock
import fetch from 'node-fetch';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });
const customFetch = (url: any, init?: any) => fetch(url, { ...init, agent });
(global as any).fetch = customFetch;

import express from 'express';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';
import { setupSecurityMiddlewares } from './middlewares/security.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { setupAuthMiddleware, requireAuthentication } from './middlewares/auth.middleware';

// Import Routes
import aiRoutes from './routes/AIRoutes';
import careerRoutes from './routes/CareerPathRoutes';
import userRoutes from './routes/UserRoutes';
import notificationRoutes from './routes/NotificationRoutes';
import aiHistoryRoutes from './routes/AIHistoryRoutes';
import bookmarkRoutes from './routes/BookmarkRoutes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSecurityMiddlewares(app);
setupAuthMiddleware(app);

// Mount Routes
app.use('/api/v1/ai', requireAuthentication, aiRoutes);
app.use('/api/v1/careers', careerRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/ai-history', aiHistoryRoutes);
app.use('/api/v1/bookmarks', bookmarkRoutes);

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


