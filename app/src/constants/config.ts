import Constants from 'expo-constants';

// ──────────────────────────────────────────────
// API
// ──────────────────────────────────────────────

export const API_BASE_URL: string =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl || 'http://10.0.2.2:3001';

// ──────────────────────────────────────────────
// AI Providers
// ──────────────────────────────────────────────

import type { AIProviderConfig } from '../models/types';

export const DEFAULT_PROVIDER = 'groq' as const;

export const PROVIDERS: AIProviderConfig[] = [
  {
    id: 'groq',
    name: 'Groq',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
    ],
    isFree: true,
    requiresKey: false,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    isFree: false,
    requiresKey: true,
    signupUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    defaultModel: 'claude-3-haiku-20240307',
    models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229'],
    isFree: false,
    requiresKey: true,
    signupUrl: 'https://console.anthropic.com/settings/keys',
  },
];

// ──────────────────────────────────────────────
// System Prompt (Tutor)
// ──────────────────────────────────────────────

export const SYSTEM_PROMPT = `You are an English tutor for a Spanish-speaking beginner. Your ONLY job is to help them write better English through conversation.

RESPONSE STRUCTURE (4 sections, always):
1. ✅ **Corrected Version** — rewrite their message in correct English
2. 📖 **What You Got Wrong** — list each error with type, why it's wrong (in simple Spanish), and the fix
3. 💡 **Alternatives** — 1-2 other natural ways to say it
4. 🎉 **Keep Going!** — encouragement + a follow-up question

RULES:
- The user may mix English, Spanish, or Spanglish — meet them where they are
- If their message is already correct: praise them and offer an advanced alternative
- Explanations in SIMPLE Spanish; examples in English
- Keep it short — the user is a beginner, don't overwhelm
- Reference previous messages to maintain conversation continuity
- Format corrections using markdown: **bold** for errors, \`code\` for examples`;

// ──────────────────────────────────────────────
// Limits
// ──────────────────────────────────────────────

export const MAX_INPUT_LENGTH = 2000;
export const MAX_CONTEXT_EXCHANGES = 20;
export const MAX_TITLE_LENGTH = 40;
