const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const filesToCreate = {
  'config/env.ts': `import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().url().default('mongodb://localhost:27017/careerpilot'),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
});

export const env = envSchema.parse(process.env);
`,
  'config/db.ts': `import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info("MongoDB Connected: " + conn.connection.host);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
`,
  'utils/logger.ts': `import winston from 'winston';
import { env } from '../config/env';

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});
`,
  'utils/response.ts': `import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendError = (res: Response, message = 'Error', statusCode = 500, errors?: any) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};
`,
  'middlewares/error.middleware.ts': `import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  sendError(res, message, statusCode, err.errors);
};
`,
  'middlewares/security.middleware.ts': `import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import morgan from 'morgan';
import { Application } from 'express';
import { env } from '../config/env';

export const setupSecurityMiddlewares = (app: Application) => {
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(ExpressMongoSanitize());
  app.use(compression());
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  app.use('/api', limiter);
};
`,
  'middlewares/validation.middleware.ts': `import { AnyZodObject, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const validate = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 'Validation Error', 400, error.errors);
      }
      return next(error);
    }
};
`,
  'repositories/BaseRepository.ts': `import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findOne({ _id: id, isDeleted: false } as FilterQuery<T>);
  }

  async findOne(query: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne({ ...query, isDeleted: false });
  }

  async find(query: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find({ ...query, isDeleted: false });
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findOneAndUpdate(
      { _id: id, isDeleted: false } as FilterQuery<T>, 
      data, 
      { new: true }
    );
  }

  async softDelete(id: string): Promise<T | null> {
    return this.model.findOneAndUpdate(
      { _id: id } as FilterQuery<T>,
      { isDeleted: true, deletedAt: new Date() } as UpdateQuery<T>,
      { new: true }
    );
  }
}
`,
  'index.ts': `import express from 'express';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';
import { setupSecurityMiddlewares } from './middlewares/security.middleware';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSecurityMiddlewares(app);

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    logger.info("Server running on port " + env.PORT + " in " + env.NODE_ENV + " mode");
  });
};

if (require.main === module) {
  startServer();
}

export default app;
`
};

const models = [
  'User', 'CareerPath', 'ResumeAnalysis', 'InterviewSession', 
  'Blog', 'Review', 'Notification', 'Bookmark', 'AIHistory'
];

models.forEach(m => {
  const l = m.toLowerCase();
  
  filesToCreate['models/' + m + '.model.ts'] = "import mongoose, { Schema, Document } from 'mongoose';\n\n" +
"export interface I" + m + " extends Document {\n" +
"  isDeleted: boolean;\n" +
"  deletedAt: Date | null;\n" +
"  createdAt: Date;\n" +
"  updatedAt: Date;\n" +
"}\n\n" +
"const " + l + "Schema = new Schema({\n" +
"  isDeleted: { type: Boolean, default: false },\n" +
"  deletedAt: { type: Date, default: null }\n" +
"}, {\n" +
"  timestamps: true\n" +
"});\n\n" +
l + "Schema.index({ isDeleted: 1 });\n\n" +
"export const " + m + " = mongoose.model<I" + m + ">('" + m + "', " + l + "Schema);\n";

  filesToCreate['repositories/' + m + 'Repository.ts'] = "import { BaseRepository } from './BaseRepository';\n" +
"import { " + m + ", I" + m + " } from '../models/" + m + ".model';\n\n" +
"export class " + m + "Repository extends BaseRepository<I" + m + "> {\n" +
"  constructor() {\n" +
"    super(" + m + ");\n" +
"  }\n" +
"}\n\n" +
"export const " + l + "Repository = new " + m + "Repository();\n";

  filesToCreate['services/' + m + 'Service.ts'] = "import { " + l + "Repository } from '../repositories/" + m + "Repository';\n\n" +
"export class " + m + "Service {\n" +
"  async get" + m + "ById(id: string) {\n" +
"    return " + l + "Repository.findById(id);\n" +
"  }\n" +
"}\n\n" +
"export const " + l + "Service = new " + m + "Service();\n";

  filesToCreate['controllers/' + m + 'Controller.ts'] = "import { Request, Response, NextFunction } from 'express';\n" +
"import { " + l + "Service } from '../services/" + m + "Service';\n" +
"import { sendSuccess } from '../utils/response';\n\n" +
"export const get" + m + " = async (req: Request, res: Response, next: NextFunction) => {\n" +
"  try {\n" +
"    const data = await " + l + "Service.get" + m + "ById(req.params.id);\n" +
"    sendSuccess(res, data);\n" +
"  } catch (error) {\n" +
"    next(error);\n" +
"  }\n" +
"};\n";

  filesToCreate['routes/' + m + 'Routes.ts'] = "import { Router } from 'express';\n" +
"import { get" + m + " } from '../controllers/" + m + "Controller';\n\n" +
"const router = Router();\n\n" +
"router.get('/:id', get" + m + ");\n\n" +
"export default router;\n";
});

// Refine some models explicitly
filesToCreate['models/User.model.ts'] = `import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface IUser extends Document {
  clerkId: string;
  email: string;
  role: UserRole;
  isDeleted: boolean;
  deletedAt: Date | null;
}

const userSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ clerkId: 1 });
userSchema.index({ isDeleted: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
`;

filesToCreate['models/Notification.model.ts'] = `import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  ALERT = 'ALERT',
  MESSAGE = 'MESSAGE'
}

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  isRead: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
}

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: Object.values(NotificationType), required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
`;

filesToCreate['models/CareerPath.model.ts'] = `import mongoose, { Schema, Document } from 'mongoose';

export interface ICareerPath extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  steps: string[];
  isDeleted: boolean;
  deletedAt: Date | null;
}

const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  steps: [{ type: String }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

schema.index({ user: 1, isDeleted: 1 });

export const CareerPath = mongoose.model<ICareerPath>('CareerPath', schema);
`;

for (const [relativePath, content] of Object.entries(filesToCreate)) {
  const fullPath = path.join(srcDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
}

console.log('Backend architecture generated successfully.');
