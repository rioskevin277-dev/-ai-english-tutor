import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';

const anthropic = config.anthropicApiKey
  ? new Anthropic({ apiKey: config.anthropicApiKey })
  : null;

const DEFAULT_MODEL = 'claude-3-haiku-20240307';

interface AnthropicResponse {
  reply: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    provider: string;
  };
}

type AnthropicMessage = {
  role: 'user' | 'assistant';
  content: string;
};

/**
 * Send a chat completion request to Anthropic.
 * Anthropic's API uses a different message format — we convert from the unified format.
 */
export async function sendChat(
  messages: Array<{ role: string; content: string }>,
  model?: string,
): Promise<AnthropicResponse> {
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  // Extract system prompt if present (Anthropic has a separate system param)
  let systemPrompt = '';
  const apiMessages: AnthropicMessage[] = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemPrompt += msg.content + '\n';
    } else if (msg.role === 'user' || msg.role === 'assistant') {
      apiMessages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
    }
  }

  const completion = await anthropic.messages.create({
    model: model || DEFAULT_MODEL,
    max_tokens: 1024,
    system: systemPrompt.trim() || undefined,
    messages: apiMessages.length > 0 ? apiMessages : [{ role: 'user', content: 'Hello' }],
  });

  const textBlock = completion.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Anthropic returned an empty response');
  }

  return {
    reply: textBlock.text,
    usage: {
      promptTokens: completion.usage?.input_tokens || 0,
      completionTokens: completion.usage?.output_tokens || 0,
      provider: 'anthropic',
    },
  };
}

/**
 * Test Anthropic connectivity by sending a minimal prompt.
 */
export async function testConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    if (!anthropic) {
      return { ok: false, message: 'ANTHROPIC_API_KEY is not configured' };
    }
    await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Respond with just: ok' }],
    });
    return { ok: true, message: 'Connected' };
  } catch (err: any) {
    return { ok: false, message: err.message || 'Connection failed' };
  }
}
