import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import type { ProviderId } from '../../models/types';
import { testConnection } from '../../services/aiService';

interface ConnectionTestProps {
  provider: ProviderId;
}

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

export default function ConnectionTest({ provider }: ConnectionTestProps) {
  const [status, setStatus] = useState<TestStatus>('idle');
  const [message, setMessage] = useState('');

  const handleTest = async () => {
    setStatus('testing');
    setMessage('');

    try {
      const result = await testConnection(provider);
      if (result.status === 'connected') {
        setStatus('success');
        setMessage('Connected successfully');
      } else {
        setStatus('error');
        setMessage(result.message || 'Connection failed');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Network error');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, status === 'testing' && styles.buttonTesting]}
        onPress={handleTest}
        disabled={status === 'testing'}
      >
        {status === 'testing' ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Test Connection</Text>
        )}
      </TouchableOpacity>

      {status !== 'idle' && (
        <View style={[styles.result, status === 'success' ? styles.resultSuccess : styles.resultError]}>
          <Text style={[styles.statusIcon]}>
            {status === 'success' ? '✅' : '❌'}
          </Text>
          <Text
            style={[
              styles.resultText,
              status === 'success' ? styles.resultTextSuccess : styles.resultTextError,
            ]}
          >
            {message}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  button: {
    backgroundColor: '#0f3460',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  buttonTesting: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '600',
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
  },
  resultSuccess: {
    backgroundColor: '#1a2e1a',
  },
  resultError: {
    backgroundColor: '#2d1b1b',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  resultText: {
    fontSize: 13,
    flex: 1,
  },
  resultTextSuccess: {
    color: '#6bcb77',
  },
  resultTextError: {
    color: '#ff6b6b',
  },
});
