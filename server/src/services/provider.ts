import * as groq from './groq';
import * as openai from './openai';
import * as anthropic from './anthropic';

export type ProviderId = 'groq' | 'openai' | 'anthropic';

interface ProviderResponse {
  reply: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    provider: string;
  };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Unified provider dispatcher.
 * Routes the request to the correct provider SDK wrapper based on provider ID.
 */
export async function sendChat(
  messages: ChatMessage[],
  provider: ProviderId,
  model?: string,
): Promise<ProviderResponse> {
  switch (provider) {
    case 'groq':
      return groq.sendChat(messages, model);
    case 'openai':
      return openai.sendChat(messages, model);
    case 'anthropic':
      return anthropic.sendChat(messages, model);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Unified connection test dispatcher.
 */
export async function testConnection(
  provider: ProviderId,
): Promise<{ ok: boolean; message: string }> {
  switch (provider) {
    case 'groq':
      return groq.testConnection();
    case 'openai':
      return openai.testConnection();
    case 'anthropic':
      return anthropic.testConnection();
    default:
      return { ok: false, message: `Unknown provider: ${provider}` };
  }
}
