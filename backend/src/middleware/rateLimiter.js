import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

const skipInTest = isTest ? (req, res) => true : undefined;

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  skip: isTest
    ? (req, res) => true
    : (req) => req.path.startsWith('/api/auth'),
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skip: skipInTest,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
