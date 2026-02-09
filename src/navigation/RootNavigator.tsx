import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '@/ui/screens/HomeScreen';
import { ResultScreen } from '@/ui/screens/ResultScreen';
import { OfflineScreen } from '@/ui/screens/OfflineScreen';

export type RootStackParamList = {
  Home: undefined;
  Result: { status: string };
  Offline: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="Offline" component={OfflineScreen} />
    </Stack.Navigator>
  );
}
