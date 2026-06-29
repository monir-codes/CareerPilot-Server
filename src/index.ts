
import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';
import { setupSecurityMiddlewares } from './middlewares/security.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { setupAuthMiddleware, requireAuthentication } from './middlewares/auth.middleware';
import { sendSuccess } from './utils/response';

// Models
import { AIChatSession } from './models/AIChatSession.model';
import { ResumeAnalysis } from './models/ResumeAnalysis.model';
import { CareerPath } from './models/CareerPath.model';
import { User } from './models/User.model';
import { Notification } from './models/Notification.model';
import { Bookmark } from './models/Bookmark.model';

// Services
import { geminiService } from './services/ai/GeminiService';
import { PromptTemplates } from './services/ai/PromptTemplates';
import { userService } from './services/UserService';

const pdfParse = require('pdf-parse');

const app = express();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSecurityMiddlewares(app);
setupAuthMiddleware(app);

// Connect DB for serverless environments before handling any routes
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// AI Routes
app.post('/api/v1/ai/resume/analyze', requireAuthentication, upload.single('resume'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new Error('No resume file uploaded');
    
    // Extract Text
    const data = await pdfParse(req.file.buffer);
    const resumeText = data.text;

    const prompt = PromptTemplates.resumeAnalyzer(resumeText.substring(0, 5000)); // Limit tokens
    const analysis = await geminiService.generateStructuredResponse(prompt);
    
    try {
      const clerkUserId = (req as any).auth?.userId;
      if (clerkUserId && analysis.score) {
        await ResumeAnalysis.create({
          clerkUserId,
          score: analysis.score
        });
      }
    } catch (e) {
      console.error("Failed to save resume score to DB", e);
    }
    
    sendSuccess(res, analysis, 'Resume analyzed successfully', 200);
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/ai/cover-letter/generate', requireAuthentication, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prompt = PromptTemplates.coverLetterGenerator(req.body);
    const result = await geminiService.generateStructuredResponse(prompt);
    sendSuccess(res, result, 'Cover letter generated', 200);
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/ai/roadmap/generate', requireAuthentication, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prompt = PromptTemplates.careerRoadmap(req.body);
    const result = await geminiService.generateStructuredResponse(prompt);
    sendSuccess(res, result, 'Roadmap generated', 200);
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/ai/interview/questions', requireAuthentication, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    const prompt = PromptTemplates.interviewAssistant(role);
    const result = await geminiService.generateStructuredResponse(prompt);
    sendSuccess(res, result, 'Questions generated', 200);
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/ai/chat/sessions', requireAuthentication, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkUserId = (req as any).auth?.userId;
    if (!clerkUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const sessions = await AIChatSession.find({ clerkUserId }).select('title createdAt updatedAt').sort({ updatedAt: -1 });
    sendSuccess(res, sessions, 'Sessions fetched', 200);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
});

app.get('/api/v1/ai/chat/sessions/:id', requireAuthentication, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkUserId = (req as any).auth?.userId;
    const { id } = req.params;
    
    const session = await AIChatSession.findOne({ _id: id, clerkUserId });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    sendSuccess(res, session, 'Session fetched', 200);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch session' });
  }
});

app.post('/api/v1/ai/chat', requireAuthentication, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkUserId = (req as any).auth?.userId;
    if (!clerkUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { message, sessionId } = req.body;
    
    let session;
    let isNewSession = false;
    
    if (sessionId) {
      session = await AIChatSession.findOne({ _id: sessionId, clerkUserId });
    }
    
    if (!session) {
      // Create new session
      const title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
      session = new AIChatSession({ 
        clerkUserId, 
        title, 
        topic: 'General Inquiry',
        details: 'A career-related conversation.',
        messages: [] 
      });
      isNewSession = true;
    }

    // Add user message
    session.messages.push({ role: 'user', content: message, timestamp: new Date() });
    
    // Hit Gemini
    const responseText = await geminiService.chat(session.messages.slice(0, -1), message);
    
    // Add AI response
    session.messages.push({ role: 'ai', content: responseText, timestamp: new Date() });
    await session.save();

    // Generate topic and details asynchronously for new sessions
    if (isNewSession) {
      geminiService.generateStructuredResponse(`Analyze this query: "${message}". Respond with JSON containing "topic" (2-4 words) and "details" (1 sentence summary).`)
        .then(async (summary: any) => {
           await AIChatSession.updateOne(
             { _id: session._id }, 
             { topic: summary.topic, details: summary.details }
           );
        }).catch((err: any) => console.error('Topic generation failed', err));
    }

    sendSuccess(res, { text: responseText, sessionId: session._id }, 'Chat response generated', 200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Chat generation failed' });
  }
});

app.post('/api/v1/ai/chat/sync', requireAuthentication, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkUserId = (req as any).auth?.userId;
    if (!clerkUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { messages, sessionId, title } = req.body;
    
    let session;
    if (sessionId) {
      session = await AIChatSession.findOne({ _id: sessionId, clerkUserId });
    }
    
    if (!session) {
      session = new AIChatSession({ 
        clerkUserId, 
        title: title || (messages.length > 0 ? messages[0].content.substring(0, 30) : 'New Chat'), 
        topic: 'Direct Chat Sync',
        details: 'Direct chat with Gemini API.',
        messages: [] 
      });
    }

    // Overwrite or append messages
    session.messages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp || new Date()
    }));

    await session.save();

    sendSuccess(res, { sessionId: session._id }, 'Chat synced', 200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Sync failed' });
  }
});

// Career Paths Routes
app.get('/api/v1/careers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search, exp, sort, page = 1, limit = 9 } = req.query;
    let query: any = { isDeleted: false };
    
    if (category && category !== 'All Categories') {
      query.category = category;
    }
    
    if (exp && exp !== 'All Levels') {
      query.exp = exp;
    }
    
    if (search) {
      query.$text = { $search: search as string };
    }

    let sortObj: any = {};
    if (sort === 'salary_desc') {
      sortObj = { 'salary.max': -1 }; // assuming salary object exists, else we could sort by string if it's "100k"
    } else if (sort === 'latest') {
      sortObj = { createdAt: -1 };
    } else if (search) {
      sortObj = { score: { $meta: 'textScore' } };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await CareerPath.countDocuments(query);
    const careers = await CareerPath.find(query).sort(sortObj).skip(skip).limit(limitNum);
    
    sendSuccess(res, { careers, total, page: pageNum, totalPages: Math.ceil(total / limitNum) }, 'Careers fetched successfully', 200);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch careers' });
  }
});

app.get('/api/v1/careers/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const career = await CareerPath.findOne({ _id: req.params.id, isDeleted: false });
    if (!career) return res.status(404).json({ success: false, message: 'Career not found' });
    
    sendSuccess(res, career, 'Career fetched successfully', 200);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Invalid ID or failed to fetch' });
  }
});

// User Routes
app.get('/api/v1/users/overview', requireAuthentication, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    // Total Chats
    const totalChats = await AIChatSession.countDocuments({ clerkUserId: clerkId });
    
    // Total Messages
    const sessions = await AIChatSession.find({ clerkUserId: clerkId }).select('messages');
    let totalMessages = 0;
    sessions.forEach((s: any) => {
      totalMessages += s.messages.length;
    });

    // Resume Stats
    const latestResume = await ResumeAnalysis.findOne({ clerkUserId: clerkId }).sort({ createdAt: -1 });
    const resumeHistory = await ResumeAnalysis.find({ clerkUserId: clerkId }).sort({ createdAt: 1 }).limit(10);
    
    // Saved Careers
    const savedCareers = await Bookmark.countDocuments({ clerkUserId: clerkId, isDeleted: false });

    const chartData = resumeHistory.map((r: any) => ({
      name: new Date(r.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
      score: r.score
    }));

    if (chartData.length === 0) {
      chartData.push({ name: 'No Data', score: 0 });
    }

    sendSuccess(res, {
      totalChats,
      totalMessages,
      resumeScore: latestResume ? latestResume.score : 0,
      savedCareers,
      chartData
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/users/profile', requireAuthentication, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    let user = await User.findOne({ clerkId });
    if (!user) {
      user = await User.create({ clerkId });
    }
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

app.put('/api/v1/users/profile', requireAuthentication, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { fullName, title, bio } = req.body;
    const user = await User.findOneAndUpdate(
      { clerkId },
      { fullName, title, bio },
      { new: true, runValidators: true, upsert: true }
    );
    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.getUserById(req.params.id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

// Notification Routes
app.get('/api/v1/notifications', requireAuthentication, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const notifications = await Notification.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ user: user._id, isRead: false });

    sendSuccess(res, { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
});

app.put('/api/v1/notifications/:id/read', requireAuthentication, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: user._id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    
    sendSuccess(res, notification);
  } catch (error) {
    next(error);
  }
});

// AI History Routes
app.get('/api/v1/ai-history', requireAuthentication, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkUserId = (req as any).auth?.userId;
    if (!clerkUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const chatSessions = await AIChatSession.find({ clerkUserId }).sort({ updatedAt: -1 });
    
    // Map to a generic history format
    const history = chatSessions.map((session: any) => ({
      id: session._id,
      title: session.title,
      type: 'Chat Session',
      topic: session.topic || 'General Inquiry',
      details: session.details || 'A career-related conversation.',
      date: session.updatedAt,
      messageCount: session.messages.length
    }));

    sendSuccess(res, history);
  } catch (error) {
    next(error);
  }
});

// Bookmark Routes
app.post('/api/v1/bookmarks/toggle', requireAuthentication, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { careerId } = req.body;
    
    const existing = await Bookmark.findOne({ clerkUserId: clerkId, careerId });
    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return sendSuccess(res, { bookmarked: false }, 'Removed bookmark');
    } else {
      await Bookmark.create({ clerkUserId: clerkId, careerId });
      return sendSuccess(res, { bookmarked: true }, 'Added bookmark');
    }
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/bookmarks/check/:careerId', requireAuthentication, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { careerId } = req.params;
    
    const existing = await Bookmark.findOne({ clerkUserId: clerkId, careerId });
    return sendSuccess(res, { bookmarked: !!existing });
  } catch (error) {
    next(error);
  }
});

// Health Check / Root Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: '🚀 CareerPilot AI Backend Server is running successfully!',
    version: '1.0.0'
  });
});

app.use(errorHandler);

export default app;
module.exports = app;
