import rateLimit from 'express-rate-limit';
import { config } from '../config';

/**
 * Per-IP rate limiter middleware.
 * Default: 30 requests per 60-second window per IP.
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later.',
    code: 'RATE_LIMITED',
  },
});
