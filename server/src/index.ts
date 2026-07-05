import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { rateLimiter } from './middleware/rateLimit';
import chatRouter from './routes/chat';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: config.corsOrigin === '*' ? '*' : config.corsOrigin.split(',').map((s) => s.trim()),
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Body parser
app.use(express.json({ limit: '100kb' }));

// Rate limiting
app.use('/api', rateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// API routes
app.use('/api', chatRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
});

// Start server
app.listen(config.port, () => {
  console.log(`[server] AI English Tutor proxy running on port ${config.port}`);
  console.log(`[server] CORS origin: ${config.corsOrigin}`);
  console.log(`[server] Groq configured: ${!!config.groqApiKey}`);
  console.log(`[server] OpenAI configured: ${!!config.openaiApiKey}`);
  console.log(`[server] Anthropic configured: ${!!config.anthropicApiKey}`);
});

export default app;
