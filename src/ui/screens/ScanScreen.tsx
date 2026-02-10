// src/ui/screens/ScanScreen.tsx

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useCodeScanner } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/navigation/RootNavigator';
import { parseIdentifier } from '@/utils/parseIdentifier';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Scan'>;

export function ScanScreen() {
  const navigation = useNavigation<Nav>();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  const onCodeScanned = (raw: string) => {
    const identifier = parseIdentifier(raw);

    if (!identifier) {
      navigation.replace('Result', { status: 'invalid' });
      return;
    }

    navigation.replace('Result', {
      status: 'scanned',
      raw: identifier,
    });
  };

  const codeScanner = useCodeScanner({
  codeTypes: ['qr'],
  onCodeScanned: (codes) => {
    if (codes.length > 0) {
      const value = codes[0].value;
      if (value) {
        runOnJS(onCodeScanned)(value);
      }
    }
  },
});


  if (!device) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cámara no disponible</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Permiso de cámara requerido</Text>
      </View>
    );
  }

  return (
    <Camera
  style={{ flex: 1 }}
  device={device}
  isActive={true}
  codeScanner={codeScanner}
/>
  );
}
