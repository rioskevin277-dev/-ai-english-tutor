import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProviderId } from '../models/types';
import { DEFAULT_PROVIDER } from '../constants/config';

const ACTIVE_PROVIDER_KEY = '@ai_tutor/active_provider';
const PROVIDER_STATUS_KEY = '@ai_tutor/provider_status';

export type ProviderStatusValue = 'connected' | 'error' | 'untested';
export type ProviderStatusMap = Record<ProviderId, ProviderStatusValue>;

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

// ──────────────────────────────────────────────
// Provider Status
// ──────────────────────────────────────────────

/**
 * Load the persisted status for all providers.
 */
export async function loadProviderStatus(): Promise<ProviderStatusMap> {
  try {
    const json = await AsyncStorage.getItem(PROVIDER_STATUS_KEY);
    if (json) return JSON.parse(json) as ProviderStatusMap;
    return { groq: 'untested', openai: 'untested', anthropic: 'untested' };
  } catch (err) {
    console.error('[config] Failed to load provider status:', err);
    return { groq: 'untested', openai: 'untested', anthropic: 'untested' };
  }
}

/**
 * Save the status for a single provider (merged).
 */
export async function saveProviderStatus(
  provider: ProviderId,
  status: ProviderStatusValue,
): Promise<void> {
  try {
    const current = await loadProviderStatus();
    current[provider] = status;
    await AsyncStorage.setItem(PROVIDER_STATUS_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('[config] Failed to save provider status:', err);
  }
}
