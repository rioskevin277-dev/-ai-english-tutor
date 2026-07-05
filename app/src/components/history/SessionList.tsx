import React from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import type { ChatSession } from '../../models/types';
import SessionCard from './SessionCard';

interface SessionListProps {
  sessions: ChatSession[];
  onSessionPress: (session: ChatSession) => void;
  onSessionDelete: (sessionId: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function SessionList({
  sessions,
  onSessionPress,
  onSessionDelete,
  onRefresh,
  isRefreshing,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={styles.emptyTitle}>No sessions yet</Text>
        <Text style={styles.emptySubtitle}>Start a chat and your sessions will appear here.</Text>
      </View>
    );
  }

  // Sort by most recent first
  const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SessionCard
          session={item}
          onPress={() => onSessionPress(item)}
          onDelete={() => onSessionDelete(item.id)}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#e94560"
          colors={['#e94560']}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 8,
    paddingBottom: 24,
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
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
