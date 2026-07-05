import type { ProviderId, ChatResponse, TestResponse } from '../models/types';
import { API_BASE_URL } from '../constants/config';

/**
 * Send a chat completion request through the backend proxy.
 */
export async function sendMessage(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  provider: ProviderId,
  model?: string,
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, provider, model }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const errorMessage = errorBody.error || `HTTP ${response.status}`;
    const code = errorBody.code || 'UNKNOWN';

    if (response.status === 429) {
      throw new ProviderError('Rate limit exceeded. Please try again later.', 'RATE_LIMITED');
    }
    if (response.status === 502) {
      throw new ProviderError(
        errorMessage,
        code === 'PROVIDER_NOT_CONFIGURED' ? 'PROVIDER_NOT_CONFIGURED' : 'PROVIDER_ERROR',
      );
    }
    throw new ProviderError(errorMessage, code);
  }

  const data: ChatResponse = await response.json();
  return data;
}

/**
 * Test connection to a specific AI provider through the backend proxy.
 */
export async function testConnection(provider: ProviderId): Promise<TestResponse> {
  const response = await fetch(`${API_BASE_URL}/api/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider }),
  });

  const data: TestResponse = await response.json();
  return data;
}

/**
 * Custom error class for provider errors.
 */
export class ProviderError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'ProviderError';
    this.code = code;
  }
}
