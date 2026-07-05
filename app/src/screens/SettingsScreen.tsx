import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { PROVIDERS } from '../constants/config';
import ProviderCard from '../components/settings/ProviderCard';
import type { ProviderId } from '../models/types';

export default function SettingsScreen() {
  const { state, switchProvider } = useAppContext();

  const handleProviderSelect = useCallback(
    async (providerId: ProviderId) => {
      await switchProvider(providerId);
    },
    [switchProvider],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Provider</Text>
        <Text style={styles.sectionDescription}>
          Select which AI provider to use for chat. Groq is free and the default.
        </Text>
      </View>

      {PROVIDERS.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          isActive={state.activeProvider === provider.id}
          onSelect={handleProviderSelect}
        />
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Server Connection</Text>
        <Text style={styles.sectionDescription}>
          The app connects to a backend proxy that routes requests to AI providers.{'\n'}
          No API keys are stored on your device.
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>About</Text>
        <Text style={styles.infoText}>
          AI English Tutor v1.0.0{'\n'}
          Uses Groq (free) by default. OpenAI and Anthropic are optional alternatives.{'\n\n'}
          Your conversations are stored locally on this device only.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  content: {
    paddingVertical: 16,
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#e0e0e0',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDescription: {
    color: '#888',
    fontSize: 13,
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  infoTitle: {
    color: '#e94560',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    color: '#888',
    fontSize: 13,
    lineHeight: 20,
  },
});
