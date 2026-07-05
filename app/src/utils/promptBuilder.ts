import type { ChatMessage } from '../models/types';
import { SYSTEM_PROMPT, MAX_CONTEXT_EXCHANGES, MAX_INPUT_LENGTH } from '../constants/config';

export interface BuiltPrompt {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  truncated: boolean;
}

/**
 * Build the context window for the AI:
 * - System prompt (always first)
 * - Last N exchanges (user + assistant pairs)
 * - Current user message
 *
 * Older messages beyond MAX_CONTEXT_EXCHANGES are truncated.
 */
export function buildPrompt(
  currentMessage: string,
  history: ChatMessage[],
): BuiltPrompt {
  // Sanitize input
  const sanitizedMessage = currentMessage.trim().slice(0, MAX_INPUT_LENGTH);

  const messages: BuiltPrompt['messages'] = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  // Get the last N exchanges (user+assistant pairs)
  const recentHistory = history.slice(-(MAX_CONTEXT_EXCHANGES * 2));

  const truncated = history.length > recentHistory.length;

  // Add conversation history
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role,
      content: msg.text.slice(0, MAX_INPUT_LENGTH),
    });
  }

  // Add current message
  messages.push({ role: 'user', content: sanitizedMessage });

  return { messages, truncated };
}

/**
 * Validate that input is not empty after trimming.
 */
export function isValidInput(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  // Reject if only punctuation or whitespace
  if (/^[^\w\d]+$/.test(trimmed)) return false;
  return true;
}
