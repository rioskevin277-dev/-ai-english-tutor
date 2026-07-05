import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

// Global handler for uncaught JS errors
if (global.ErrorUtils) {
  const originalHandler = global.ErrorUtils.getGlobalHandler
    ? global.ErrorUtils.getGlobalHandler()
    : null;
  global.ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    console.error('[FATAL]', error?.toString?.() || error);
    if (originalHandler && isFatal) {
      originalHandler(error, isFatal);
    }
  });
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </AppProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
