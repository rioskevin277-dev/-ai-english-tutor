import { Router, Request, Response } from 'express';
import * as providerService from '../services/provider';

const router = Router();

interface ChatRequestBody {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  provider: string;
  model?: string;
}

interface TestRequestBody {
  provider: string;
}

/**
 * POST /api/chat
 *
 * Sends a chat completion request to the specified AI provider.
 * Request body:
 *   { messages: {role, content}[], provider: string, model?: string }
 * Response:
 *   { reply: string, usage: { promptTokens, completionTokens, provider } }
 */
router.post('/chat', async (req: Request<{}, {}, ChatRequestBody>, res: Response) => {
  try {
    const { messages, provider, model } = req.body;

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'messages is required and must be a non-empty array',
        code: 'INVALID_INPUT',
      });
    }

    if (!provider || typeof provider !== 'string') {
      return res.status(400).json({
        error: 'provider is required',
        code: 'INVALID_INPUT',
      });
    }

    // Validate message structure
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return res.status(400).json({
          error: 'Each message must have a role and content',
          code: 'INVALID_INPUT',
        });
      }
    }

    // Truncate input: max 2000 chars per message
    const sanitizedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content.slice(0, 2000),
    }));

    // Dispatch to provider
    const result = await providerService.sendChat(
      sanitizedMessages,
      provider as providerService.ProviderId,
      model,
    );

    return res.json(result);
  } catch (err: any) {
    console.error('[chat] Error:', err.message);

    // Handle specific error types
    if (err.status === 429 || err.message?.includes('rate')) {
      return res.status(429).json({
        error: 'Provider rate limit exceeded. Please try again later.',
        code: 'RATE_LIMITED',
      });
    }

    if (err.message?.includes('not configured')) {
      return res.status(502).json({
        error: `Provider "${req.body.provider}" is not configured on the server.`,
        code: 'PROVIDER_NOT_CONFIGURED',
      });
    }

    return res.status(502).json({
      error: 'AI provider returned an error. Please try again.',
      code: 'PROVIDER_ERROR',
      details: err.message,
    });
  }
});

/**
 * POST /api/test
 *
 * Tests connectivity to a specific AI provider.
 * Request body:
 *   { provider: string }
 * Response:
 *   { status: 'connected' | 'error', message: string }
 */
router.post('/test', async (req: Request<{}, {}, TestRequestBody>, res: Response) => {
  try {
    const { provider } = req.body;

    if (!provider || typeof provider !== 'string') {
      return res.status(400).json({
        error: 'provider is required',
        code: 'INVALID_INPUT',
      });
    }

    const result = await providerService.testConnection(
      provider as providerService.ProviderId,
    );

    return res.json({
      status: result.ok ? 'connected' : 'error',
      message: result.message,
    });
  } catch (err: any) {
    return res.json({
      status: 'error',
      message: err.message || 'Connection test failed',
    });
  }
});

export default router;
