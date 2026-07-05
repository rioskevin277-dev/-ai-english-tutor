import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProviderId } from '../models/types';
import { DEFAULT_PROVIDER } from '../constants/config';

const ACTIVE_PROVIDER_KEY = '@ai_tutor/active_provider';

/**
 * Load the saved active provider ID.
 * Returns the default provider if none is saved.
 */
export async function loadActiveProvider(): Promise<ProviderId> {
  try {
    const value = await AsyncStorage.getItem(ACTIVE_PROVIDER_KEY);
    if (value && ['groq', 'openai', 'anthropic'].includes(value)) {
      return value as ProviderId;
    }
    return DEFAULT_PROVIDER;
  } catch (err) {
    console.error('[config] Failed to load active provider:', err);
    return DEFAULT_PROVIDER;
  }
}

/**
 * Save the active provider ID.
 */
export async function saveActiveProvider(provider: ProviderId): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_PROVIDER_KEY, provider);
  } catch (err) {
    console.error('[config] Failed to save active provider:', err);
  }
}
