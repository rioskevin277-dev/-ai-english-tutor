import React, { useRef, useEffect } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import type { ChatMessage } from '../../models/types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onRetry?: () => void;
}

export default function MessageList({ messages, isLoading, onRetry }: MessageListProps) {
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Empty state
  if (messages.length === 0 && !isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>✍️</Text>
        <Text style={styles.emptyTitle}>Write something in English</Text>
        <Text style={styles.emptySubtitle}>
          Type a message below and I'll help you improve your writing.
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <MessageBubble message={item} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />
      {isLoading && <TypingIndicator />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#e0e0e0',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
