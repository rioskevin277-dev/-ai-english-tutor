import React, { useCallback, useMemo, useState } from 'react';
import { View, TextInput, Alert, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { ChatSession } from '../models/types';
import { useAppContext } from '../context/AppContext';
import * as storageService from '../services/storageService';
import SessionList from '../components/history/SessionList';
import SkeletonCard from '../components/history/SkeletonCard';

type HistoryNavProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

export default function HistoryScreen() {
  const navigation = useNavigation<HistoryNavProp>();
  const { loadSession } = useAppContext();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadSessions = useCallback(async () => {
    try {
      const loaded = await storageService.loadSessions();
      setSessions(loaded);
    } catch (err) {
      console.error('[History] Failed to load sessions:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Filter sessions by search query (title or summary)
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.trim().toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.summary && s.summary.toLowerCase().includes(q)),
    );
  }, [sessions, searchQuery]);

  // Reload sessions every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadSessions();
    }, [loadSessions]),
  );

  const handleSessionPress = useCallback(
    async (session: ChatSession) => {
      await loadSession(session.id);
      navigation.navigate('Chat');
    },
    [loadSession, navigation],
  );

  const handleSessionDelete = useCallback(
    (sessionId: string) => {
      Alert.alert(
        'Delete Session',
        'Are you sure? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await storageService.deleteSession(sessionId);
              await loadSessions();
            },
          },
        ],
      );
    },
    [loadSessions],
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadSessions();
  }, [loadSessions]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.skeletonContainer}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search sessions..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      <SessionList
        sessions={filteredSessions}
        hasActiveSearch={searchQuery.trim().length > 0}
        onSessionPress={handleSessionPress}
        onSessionDelete={handleSessionDelete}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  skeletonContainer: {
    flex: 1,
    paddingTop: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  searchInput: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#e0e0e0',
    fontSize: 15,
  },
});
