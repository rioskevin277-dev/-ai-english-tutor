import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MAX_INPUT_LENGTH } from '../../constants/config';
import { isValidInput } from '../../utils/promptBuilder';

interface InputBarProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (disabled) return;
    if (!isValidInput(text)) return;

    onSend(text.trim());
    setText('');
  };

  const remaining = MAX_INPUT_LENGTH - text.length;

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Write something in English..."
          placeholderTextColor="#666"
          multiline
          maxLength={MAX_INPUT_LENGTH}
          editable={!disabled}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit
        />
        <TouchableOpacity
          style={[styles.sendButton, (!isValidInput(text) || disabled) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!isValidInput(text) || disabled}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
      {text.length > MAX_INPUT_LENGTH - 100 && (
        <Text style={[styles.counter, remaining < 20 && styles.counterWarning]}>
          {remaining}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#0f3460',
    color: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#2a2a4e',
    opacity: 0.5,
  },
  sendIcon: {
    color: '#fff',
    fontSize: 18,
  },
  counter: {
    color: '#666',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 52,
  },
  counterWarning: {
    color: '#e94560',
  },
});
