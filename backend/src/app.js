import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import mongoose from 'mongoose';

import corsOptions from './config/cors.js';
import swaggerSpec from './config/swagger.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// Trust proxy in non-development environments (required for rate limiting behind reverse proxy)
if (process.env.NODE_ENV !== 'development') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  const status = dbReady ? 'ok' : 'degraded';
  const statusCode = dbReady ? 200 : 503;
  res.status(statusCode).json({ status, timestamp: new Date().toISOString(), db: dbReady });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

export default app;
