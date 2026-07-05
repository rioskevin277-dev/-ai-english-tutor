import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatSession, ChatMessage } from '../models/types';

const SESSIONS_KEY = '@ai_tutor/sessions';
const ACTIVE_SESSION_KEY = '@ai_tutor/active_session';

// ──────────────────────────────────────────────
// Session CRUD
// ──────────────────────────────────────────────

/**
 * Load all saved sessions.
 */
export async function loadSessions(): Promise<ChatSession[]> {
  try {
    const json = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!json) return [];
    return JSON.parse(json) as ChatSession[];
  } catch (err) {
    console.error('[storage] Failed to load sessions:', err);
    return [];
  }
}

/**
 * Save all sessions (full overwrite).
 */
export async function saveSessions(sessions: ChatSession[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('[storage] Failed to save sessions:', err);
  }
}

/**
 * Get a single session by ID.
 */
export async function getSession(sessionId: string): Promise<ChatSession | null> {
  const sessions = await loadSessions();
  return sessions.find((s) => s.id === sessionId) || null;
}

/**
 * Save (create or update) a session.
 */
export async function saveSession(session: ChatSession): Promise<void> {
  const sessions = await loadSessions();
  const index = sessions.findIndex((s) => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  await saveSessions(sessions);
}

/**
 * Delete a session by ID.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const sessions = await loadSessions();
  const filtered = sessions.filter((s) => s.id !== sessionId);
  await saveSessions(filtered);
}

// ──────────────────────────────────────────────
// Active Session
// ──────────────────────────────────────────────

/**
 * Save the active session ID.
 */
export async function saveActiveSessionId(sessionId: string | null): Promise<void> {
  try {
    if (sessionId) {
      await AsyncStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
    } else {
      await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  } catch (err) {
    console.error('[storage] Failed to save active session:', err);
  }
}

/**
 * Load the active session ID.
 */
export async function loadActiveSessionId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
  } catch (err) {
    console.error('[storage] Failed to load active session:', err);
    return null;
  }
}

// ──────────────────────────────────────────────
// Vocabulary
// ──────────────────────────────────────────────

/**
 * Add a new word to a session's vocabularyLearned list (deduplicated).
 */
export async function addVocabularyToSession(sessionId: string, word: string): Promise<void> {
  const session = await getSession(sessionId);
  if (!session) return;

  const trimmed = word.trim().toLowerCase();
  if (!trimmed) return;

  // Initialize vocabularyLearned for sessions saved before this field existed
  if (!session.vocabularyLearned) {
    session.vocabularyLearned = [];
  }

  if (!session.vocabularyLearned.includes(trimmed)) {
    session.vocabularyLearned.push(trimmed);
    session.updatedAt = Date.now();
    await saveSession(session);
  }
}

// ──────────────────────────────────────────────
// Message Helpers
// ──────────────────────────────────────────────

/**
 * Append a message to a session and persist.
 */
export async function appendMessage(sessionId: string, message: ChatMessage): Promise<void> {
  const session = await getSession(sessionId);
  if (!session) return;

  session.messages.push(message);
  session.messageCount = session.messages.length;
  session.updatedAt = Date.now();

  // Count errors in corrections
  let errorCount = 0;
  for (const msg of session.messages) {
    if (msg.correction?.errors) {
      errorCount += msg.correction.errors.length;
    }
  }
  session.errorCount = errorCount;

  // Auto-update title from first user message
  if (session.messages.length === 1 && message.role === 'user') {
    session.title = message.text.slice(0, 40) + (message.text.length > 40 ? '...' : '');
  }

  await saveSession(session);
}
