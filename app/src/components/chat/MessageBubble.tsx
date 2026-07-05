import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import type { ChatMessage } from '../../models/types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {isUser ? (
          <Text style={styles.userText}>{message.text}</Text>
        ) : (
          <View>
            <Markdown style={markdownStyles}>{message.text}</Markdown>
            {message.correction && message.correction.errors.length > 0 && (
              <View style={styles.correctionBlock}>
                <Text style={styles.correctionsTitle}>
                  Corrections ({message.correction.errors.length})
                </Text>
                {message.correction.errors.map((err, idx) => (
                  <View key={idx} style={styles.errorRow}>
                    <Text style={styles.errorType}>{err.type.toUpperCase()}</Text>
                    <Text style={styles.errorExplanation}>{err.explanation}</Text>
                    {err.alternatives.length > 0 && (
                      <Text style={styles.alternatives}>
                        Alternatives: {err.alternatives.join(', ')}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
      {message.metadata && (
        <Text style={styles.metadata}>
          {message.metadata.model} · {(message.metadata.latencyMs / 1000).toFixed(1)}s
        </Text>
      )}
    </View>
  );
}

const markdownStyles = {
  body: { color: '#e0e0e0', fontSize: 15, lineHeight: 22 },
  strong: { color: '#ff6b6b', fontWeight: '700' },
  code_inline: {
    backgroundColor: '#0f3460',
    color: '#e94560',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  fence: {
    backgroundColor: '#0f3460',
    color: '#e0e0e0',
    padding: 8,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  paragraph: { marginVertical: 4 },
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#0f3460',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#1a1a2e',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  userText: {
    color: '#e0e0e0',
    fontSize: 15,
    lineHeight: 22,
  },
  correctionBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
  },
  correctionsTitle: {
    color: '#e94560',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorRow: {
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#e94560',
  },
  errorType: {
    color: '#ffd93d',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  errorExplanation: {
    color: '#b0b0b0',
    fontSize: 13,
    lineHeight: 18,
  },
  alternatives: {
    color: '#6bcb77',
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  metadata: {
    color: '#555',
    fontSize: 10,
    marginTop: 2,
    marginHorizontal: 4,
  },
});
