import React, { useCallback, useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { ChatSession } from '../models/types';
import { useAppContext } from '../context/AppContext';
import * as storageService from '../services/storageService';
import SessionList from '../components/history/SessionList';

type HistoryNavProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

export default function HistoryScreen() {
  const navigation = useNavigation<HistoryNavProp>();
  const { loadSession } = useAppContext();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      <View style={styles.loadingContainer}>
        <SessionList
          sessions={[]}
          onSessionPress={() => {}}
          onSessionDelete={() => {}}
          onRefresh={() => {}}
          isRefreshing={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SessionList
        sessions={sessions}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#16213e',
  },
});
