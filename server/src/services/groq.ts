import Groq from 'groq-sdk';
import { config } from '../config';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';

const groq = config.groqApiKey
  ? new Groq({ apiKey: config.groqApiKey })
  : null;

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

interface GroqResponse {
  reply: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    provider: string;
  };
}

/**
 * Send a chat completion request to Groq.
 */
export async function sendChat(
  messages: ChatCompletionMessageParam[],
  model?: string,
): Promise<GroqResponse> {
  if (!groq) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const completion = await groq.chat.completions.create({
    messages,
    model: model || DEFAULT_MODEL,
    temperature: 0.7,
    max_tokens: 1024,
  });

  const choice = completion.choices[0];
  if (!choice?.message?.content) {
    throw new Error('Groq returned an empty response');
  }

  return {
    reply: choice.message.content,
    usage: {
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      provider: 'groq',
    },
  };
}

/**
 * Test Groq connectivity by sending a minimal prompt.
 */
export async function testConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    if (!groq) {
      return { ok: false, message: 'GROQ_API_KEY is not configured' };
    }
    await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Respond with just: ok' }],
      model: DEFAULT_MODEL,
      max_tokens: 10,
    });
    return { ok: true, message: 'Connected' };
  } catch (err: any) {
    return { ok: false, message: err.message || 'Connection failed' };
  }
}
