import OpenAI from 'openai';
import { config } from '../config';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = config.openaiApiKey
  ? new OpenAI({ apiKey: config.openaiApiKey })
  : null;

const DEFAULT_MODEL = 'gpt-4o-mini';

interface OpenAIResponse {
  reply: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    provider: string;
  };
}

/**
 * Send a chat completion request to OpenAI.
 */
export async function sendChat(
  messages: ChatCompletionMessageParam[],
  model?: string,
): Promise<OpenAIResponse> {
  if (!openai) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const completion = await openai.chat.completions.create({
    messages,
    model: model || DEFAULT_MODEL,
    temperature: 0.7,
    max_tokens: 1024,
  });

  const choice = completion.choices[0];
  if (!choice?.message?.content) {
    throw new Error('OpenAI returned an empty response');
  }

  return {
    reply: choice.message.content,
    usage: {
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      provider: 'openai',
    },
  };
}

/**
 * Test OpenAI connectivity by sending a minimal prompt.
 */
export async function testConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    if (!openai) {
      return { ok: false, message: 'OPENAI_API_KEY is not configured' };
    }
    await openai.chat.completions.create({
      messages: [{ role: 'user', content: 'Respond with just: ok' }],
      model: DEFAULT_MODEL,
      max_tokens: 10,
    });
    return { ok: true, message: 'Connected' };
  } catch (err: any) {
    return { ok: false, message: err.message || 'Connection failed' };
  }
}
