import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../ui/screens/HomeScreen';
import { ScanScreen } from '../ui/screens/ScanScreen';
import { ResultScreen } from '../ui/screens/ResultScreen';
import { OfflineScreen } from '../ui/screens/OfflineScreen';
import { LegalScreen } from '../ui/screens/LegalScreen';


export type RootStackParamList = {
  Home: undefined;
  Scan: undefined;
  Result: { status: string; raw?: string };
  Offline: undefined;
  Legal: undefined; 
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="Offline" component={OfflineScreen} />
      <Stack.Screen name="Legal" component={LegalScreen} />
    </Stack.Navigator>
  );
}
