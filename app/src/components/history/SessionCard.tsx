import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ChatSession } from '../../models/types';

interface SessionCardProps {
  session: ChatSession;
  onPress: () => void;
  onDelete: () => void;
}

export default function SessionCard({ session, onPress, onDelete }: SessionCardProps) {
  const date = new Date(session.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const preview =
    session.messages.length > 0
      ? session.messages[0].text.slice(0, 80) +
        (session.messages[0].text.length > 80 ? '...' : '')
      : 'Empty session';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {session.title}
        </Text>
        <Text style={styles.preview} numberOfLines={2}>
          {preview}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.stats}>
            <Text style={styles.stat}>
              {session.messageCount} msgs
            </Text>
            {session.errorCount > 0 && (
              <Text style={styles.errorStat}>
                {session.errorCount} errors
              </Text>
            )}
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preview: {
    color: '#888',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: '#666',
    fontSize: 11,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    color: '#6bcb77',
    fontSize: 11,
  },
  errorStat: {
    color: '#e94560',
    fontSize: 11,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteIcon: {
    fontSize: 18,
  },
});
