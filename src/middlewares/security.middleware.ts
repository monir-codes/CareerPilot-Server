import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import morgan from 'morgan';
import { Application } from 'express';
import { env } from '../config/env';

export const setupSecurityMiddlewares = (app: Application) => {
  app.use(helmet());
  app.use(cors({ 
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      // and allow all other origins
      callback(null, true);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-test-user-id']
  }));
  app.use(ExpressMongoSanitize());
  app.use(compression());
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  app.use('/api', limiter);
};
