// ──────────────────────────────────────────────
// Chat Message
// ──────────────────────────────────────────────

export interface CorrectionError {
  type: 'grammar' | 'vocabulary' | 'spelling' | 'style';
  explanation: string;
  alternatives: string[];
}

export interface Correction {
  original?: string;
  corrected: string;
  errors: CorrectionError[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  correction?: Correction;
  timestamp: number;
  sessionId: string;
  metadata?: {
    model: string;
    latencyMs: number;
  };
}

// ──────────────────────────────────────────────
// Chat Session
// ──────────────────────────────────────────────

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  errorCount: number;
  vocabularyLearned: string[];
  messages: ChatMessage[];
  summary?: string;
}

// ──────────────────────────────────────────────
// AI Provider
// ──────────────────────────────────────────────

export type ProviderId = 'groq' | 'openai' | 'anthropic';

export interface AIProviderConfig {
  id: ProviderId;
  name: string;
  defaultModel: string;
  models: string[];
  isFree: boolean;
  requiresKey: boolean;
  signupUrl?: string;
}

// ──────────────────────────────────────────────
// API Contracts
// ──────────────────────────────────────────────

export interface ChatRequest {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  provider: string;
  model?: string;
}

export interface ChatResponse {
  reply: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    provider: string;
  };
}

export interface TestResponse {
  status: 'connected' | 'error';
  message: string;
}

// ──────────────────────────────────────────────
// App Global State
// ──────────────────────────────────────────────

export interface AppState {
  activeSessionId: string | null;
  activeProvider: ProviderId;
  providerConfigs: AIProviderConfig[];
  isSettingsOpen: boolean;
}
