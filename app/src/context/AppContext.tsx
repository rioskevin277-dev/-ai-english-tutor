import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { ChatMessage, ProviderId } from '../models/types';
import { PROVIDERS, DEFAULT_PROVIDER } from '../constants/config';
import * as configService from '../services/configService';
import * as storageService from '../services/storageService';

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────

interface AppState {
  activeSessionId: string | null;
  activeProvider: ProviderId;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AppState = {
  activeSessionId: null,
  activeProvider: DEFAULT_PROVIDER,
  messages: [],
  isLoading: false,
  error: null,
  isInitialized: false,
};

// ──────────────────────────────────────────────
// Actions
// ──────────────────────────────────────────────

type AppAction =
  | { type: 'SET_INITIALIZED' }
  | { type: 'SET_SESSION'; sessionId: string | null; messages: ChatMessage[] }
  | { type: 'SET_PROVIDER'; provider: ProviderId }
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'CLEAR_MESSAGES' };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: true };
    case 'SET_SESSION':
      return {
        ...state,
        activeSessionId: action.sessionId,
        messages: action.messages,
        error: null,
      };
    case 'SET_PROVIDER':
      return { ...state, activeProvider: action.provider };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [], error: null };
    default:
      return state;
  }
}

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  startNewSession: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  switchProvider: (provider: ProviderId) => Promise<void>;
  clearError: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize: load saved provider and last session
  useEffect(() => {
    (async () => {
      try {
        const provider = await configService.loadActiveProvider();
        dispatch({ type: 'SET_PROVIDER', provider });

        // Restore last active session
        const sessionId = await storageService.loadActiveSessionId();
        if (sessionId) {
          const session = await storageService.getSession(sessionId);
          if (session) {
            dispatch({
              type: 'SET_SESSION',
              sessionId: session.id,
              messages: session.messages,
            });
          }
        }
      } catch (err) {
        console.error('[AppContext] Init error:', err);
      } finally {
        dispatch({ type: 'SET_INITIALIZED' });
      }
    })();
  }, []);

  const startNewSession = async () => {
    const uuid = require('react-native-uuid');
    const sessionId = uuid.v4();
    dispatch({ type: 'SET_SESSION', sessionId, messages: [] });
    await storageService.saveActiveSessionId(sessionId);
    // Create empty session in storage
    await storageService.saveSession({
      id: sessionId,
      title: 'New Session',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 0,
      errorCount: 0,
      messages: [],
    });
  };

  const loadSession = async (sessionId: string) => {
    const session = await storageService.getSession(sessionId);
    if (session) {
      dispatch({
        type: 'SET_SESSION',
        sessionId: session.id,
        messages: session.messages,
      });
      await storageService.saveActiveSessionId(sessionId);
    }
  };

  const switchProvider = async (provider: ProviderId) => {
    dispatch({ type: 'SET_PROVIDER', provider });
    await configService.saveActiveProvider(provider);
  };

  const clearError = () => dispatch({ type: 'SET_ERROR', error: null });

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        startNewSession,
        loadSession,
        switchProvider,
        clearError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return ctx;
}
