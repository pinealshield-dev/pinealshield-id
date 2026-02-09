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

type Nav = NativeStackNavigationProp<RootStackParamList, 'Scan'>;

/**
 * QR is UNTRUSTED input.
 * This function only normalizes and extracts a candidate identifier.
 * It does NOT decide authenticity.
 */
function parseQrStrict(raw: string): string | null {
  try {
    // URL-style QR (no DOM URL dependency)
    if (raw.startsWith('http')) {
      // Basic safe parsing
      const match = raw.match(/^https?:\/\/([^/]+)\/(.+)$/i);
      if (!match) return null;

      const host = match[1];
      const path = match[2];

      const allowedHosts = ['verify.pinealshield.com'];
      if (!allowedHosts.includes(host)) return null;

      const parts = path.split('/').filter(Boolean);
      if (parts.length >= 2 && parts[0] === 'verify') {
        return parts[1]; // hash / id
      }

      return null;
    }

    // Direct identifier (hash / short id)
    if (/^[a-zA-Z0-9_-]{16,128}$/.test(raw)) {
      return raw;
    }

    return null;
  } catch {
    return null;
  }
}

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
    const identifier = parseQrStrict(raw);

    if (!identifier) {
      navigation.replace('Result', { status: 'invalid', raw });
      return;
    }

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
