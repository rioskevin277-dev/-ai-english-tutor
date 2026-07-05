import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { AIProviderConfig, ProviderId } from '../../models/types';
import ConnectionTest from './ConnectionTest';

interface ProviderCardProps {
  provider: AIProviderConfig;
  isActive: boolean;
  onSelect: (providerId: ProviderId) => void;
}

export default function ProviderCard({ provider, isActive, onSelect }: ProviderCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.cardActive]}
      onPress={() => onSelect(provider.id)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{provider.name}</Text>
          {isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVE</Text>
            </View>
          )}
        </View>
        {provider.isFree && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>FREE</Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <Text style={styles.detailLabel}>Model</Text>
        <Text style={styles.detailValue}>{provider.defaultModel}</Text>

        <Text style={styles.detailLabel}>Models available</Text>
        <Text style={styles.detailValue}>{provider.models.length}</Text>
      </View>

      {isActive && <ConnectionTest provider={provider.id} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  cardActive: {
    borderColor: '#6bcb77',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: '#e0e0e0',
    fontSize: 18,
    fontWeight: '700',
  },
  activeBadge: {
    backgroundColor: '#6bcb77',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  freeBadge: {
    backgroundColor: '#e94560',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  details: {
    marginBottom: 4,
  },
  detailLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  detailValue: {
    color: '#b0b0b0',
    fontSize: 13,
  },
});
