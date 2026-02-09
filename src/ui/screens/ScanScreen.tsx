import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { scanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
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
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const onCodeScanned = (raw: string) => {
    const identifier = parseIdentifier(raw);

    if (!identifier) {
      // QR leído pero no válido según reglas Pineal Shield
      navigation.replace('Result', { status: 'invalid', raw });
      return;
    }

    // Identificador normalizado (hash global)
    navigation.replace('Result', { status: 'scanned', raw: identifier });
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const barcodes = scanBarcodes(frame, [BarcodeFormat.QR_CODE]);

    if (barcodes.length > 0 && barcodes[0].rawValue) {
      runOnJS(onCodeScanned)(barcodes[0].rawValue);
    }
  }, []);

  if (!device) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Cámara no disponible</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Permiso de cámara requerido</Text>
      </View>
    );
  }

  return (
    <Camera
      style={{ flex: 1 }}
      device={device}
      isActive={true}
      frameProcessor={frameProcessor}
    />
  );
}
