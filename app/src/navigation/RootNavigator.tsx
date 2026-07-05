import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatScreen from '../screens/ChatScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Chat: { sessionId?: string } | undefined;
  History: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Chat"
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#e0e0e0',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#16213e' },
        }}
      >
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ title: 'English Tutor' }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'History' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
