import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAppContext } from '../context/AppContext';
import MessageList from '../components/chat/MessageList';
import InputBar from '../components/chat/InputBar';
import { buildPrompt } from '../utils/promptBuilder';
import { parseCorrection } from '../utils/correctionParser';
import * as aiService from '../services/aiService';
import { ProviderError } from '../services/aiService';
import * as storageService from '../services/storageService';
import type { ChatMessage } from '../models/types';

type ChatNavProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;

export default function ChatScreen() {
  const navigation = useNavigation<ChatNavProp>();
  const { state, dispatch, startNewSession } = useAppContext();
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [showTruncatedBanner, setShowTruncatedBanner] = useState(false);

  // Start a new session if none active
  useEffect(() => {
    if (state.isInitialized && !state.activeSessionId) {
      startNewSession();
    }
  }, [state.isInitialized, state.activeSessionId]);

  // Auto-dismiss truncated banner after 5 seconds
  useEffect(() => {
    if (!showTruncatedBanner) return;
    const timer = setTimeout(() => setShowTruncatedBanner(false), 5000);
    return () => clearTimeout(timer);
  }, [showTruncatedBanner]);

  const handleSend = useCallback(async (text: string) => {
    if (!state.activeSessionId) return;

    const uuid = require('react-native-uuid');

    // Create user message
    const userMessage: ChatMessage = {
      id: uuid.v4(),
      role: 'user',
      text,
      timestamp: Date.now(),
      sessionId: state.activeSessionId,
    };

    dispatch({ type: 'ADD_MESSAGE', message: userMessage });
    await storageService.appendMessage(state.activeSessionId, userMessage);

    // Set loading
    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_ERROR', error: null });
    setRetryMessage(null);

    const startTime = Date.now();

    try {
      // Build prompt with context
      const { messages: promptMessages, truncated } = buildPrompt(text, state.messages);
      if (truncated) {
        setShowTruncatedBanner(true);
      }

      // Send to AI
      const response = await aiService.sendMessage(
        promptMessages,
        state.activeProvider,
      );

      // Parse correction from AI's structured markdown response
      const parsed = parseCorrection(response.reply);

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: uuid.v4(),
        role: 'assistant',
        text: parsed.text,
        timestamp: Date.now(),
        sessionId: state.activeSessionId,
        correction: parsed.correction,
        metadata: {
          model: response.usage.provider,
          latencyMs: Date.now() - startTime,
        },
      };

      dispatch({ type: 'ADD_MESSAGE', message: assistantMessage });
      await storageService.appendMessage(state.activeSessionId, assistantMessage);

      // Extract new vocabulary from the AI response (words of 3+ chars)
      const words = parsed.text
        .toLowerCase()
        .replace(/[^a-záéíóúñü\s-]/g, '')
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !['the','and','for','are','but','not','you','all','can','had','her','was','one','our','out','has','have','from','they','this','that','with','your','what','will','been','said','were','when','then','them','some','than','just','also','very','well','even','about','because','which'].includes(w));
      // Take up to 3 unique new words per response
      const uniqueWords = [...new Set(words)].slice(0, 3);
      for (const word of uniqueWords) {
        await storageService.addVocabularyToSession(state.activeSessionId, word);
      }
    } catch (err) {
      if (err instanceof ProviderError) {
        dispatch({ type: 'SET_ERROR', error: err.message });
        if (err.code === 'PROVIDER_NOT_CONFIGURED') {
          Alert.alert(
            'Provider Not Configured',
            'The selected AI provider is not configured on the server. Go to Settings to switch providers.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Settings', onPress: () => navigation.navigate('Settings') },
            ],
          );
        }
      } else {
        dispatch({ type: 'SET_ERROR', error: 'Network error. Please check your connection.' });
      }
      setRetryMessage(text);
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  }, [state.activeSessionId, state.activeProvider, state.messages, dispatch, navigation]);

  const handleRetry = useCallback(() => {
    if (retryMessage) {
      handleSend(retryMessage);
    }
  }, [retryMessage, handleSend]);

  return (
    <View style={styles.container}>
      {/* Header with navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.headerButtonText}>History</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.providerLabel}>{state.activeProvider.toUpperCase()}</Text>
          <Text style={styles.messageCount}>{state.messages.length} messages</Text>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.headerButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Truncated context banner */}
      {showTruncatedBanner && (
        <TouchableOpacity
          style={styles.truncatedBanner}
          onPress={() => setShowTruncatedBanner(false)}
          activeOpacity={0.8}
        >
          <Text style={styles.truncatedBannerText}>
            Older messages were discarded to keep the conversation context.
          </Text>
        </TouchableOpacity>
      )}

      {/* Error banner */}
      {state.error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{state.error}</Text>
          {retryMessage && (
            <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Message list */}
      <MessageList
        messages={state.messages}
        isLoading={state.isLoading}
        onRetry={retryMessage ? handleRetry : undefined}
      />

      {/* Input bar */}
      <InputBar onSend={handleSend} disabled={state.isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    color: '#e94560',
    fontSize: 14,
    fontWeight: '600',
  },
  headerCenter: {
    alignItems: 'center',
  },
  providerLabel: {
    color: '#6bcb77',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  messageCount: {
    color: '#666',
    fontSize: 11,
  },
  truncatedBanner: {
    backgroundColor: '#1a2e3e',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a4a5e',
  },
  truncatedBannerText: {
    color: '#88ccff',
    fontSize: 13,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#2d1b1b',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#4a2020',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 13,
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
