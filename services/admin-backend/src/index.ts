
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { auditMiddleware } from './middleware/audit';

// Routes
import authRoutes from './routes/auth';
import coursesRoutes from './routes/courses';
import categoriesRoutes from './routes/categories';
import instructorsRoutes from './routes/instructors';
import lessonsRoutes from './routes/lessons';
import tagsRoutes from './routes/tags';
import settingsRoutes from './routes/settings';
import uploadsRoutes from './routes/uploads';
import analyticsRoutes from './routes/analytics';
import healthRoutes from './routes/health';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

// Redis client for sessions
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

redisClient.connect();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3003'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'admin-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/courses', authMiddleware, auditMiddleware, coursesRoutes);
app.use('/api/categories', authMiddleware, auditMiddleware, categoriesRoutes);
app.use('/api/instructors', authMiddleware, auditMiddleware, instructorsRoutes);
app.use('/api/lessons', authMiddleware, auditMiddleware, lessonsRoutes);
app.use('/api/tags', authMiddleware, auditMiddleware, tagsRoutes);
app.use('/api/settings', authMiddleware, auditMiddleware, settingsRoutes);
app.use('/api/uploads', authMiddleware, uploadsRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  await redisClient.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  await redisClient.disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`Admin Backend Service running on port ${PORT}`);
});

export default app;
