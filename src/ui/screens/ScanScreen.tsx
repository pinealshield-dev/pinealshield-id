// src/ui/screens/ScanScreen.tsx

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useCodeScanner } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { parseIdentifier } from '../../utils/parseIdentifier';

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
        onCodeScanned(value);
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

  const cornerStyle = (position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight') => {
    const base = {
      position: 'absolute' as const,
      width: 28,
      height: 28,
      borderColor: '#00E0B8',
    };

    switch (position) {
      case 'topLeft':
        return {
          ...base,
          top: -1,
          left: -1,
          borderTopWidth: 3,
          borderLeftWidth: 3,
          borderTopLeftRadius: 12,
        };
      case 'topRight':
        return {
          ...base,
          top: -1,
          right: -1,
          borderTopWidth: 3,
          borderRightWidth: 3,
          borderTopRightRadius: 12,
        };
      case 'bottomLeft':
        return {
          ...base,
          bottom: -1,
          left: -1,
          borderBottomWidth: 3,
          borderLeftWidth: 3,
          borderBottomLeftRadius: 12,
        };
      case 'bottomRight':
        return {
          ...base,
          bottom: -1,
          right: -1,
          borderBottomWidth: 3,
          borderRightWidth: 3,
          borderBottomRightRadius: 12,
        };
    }
  };


  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Camera
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />

      {/* Overlay */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Texto superior */}
        <Text
          style={{
            position: 'absolute',
            top: 80,
            color: '#F3F4F6',
            fontSize: 16,
            letterSpacing: 0.5,
          }}
        >
          Escanea el código de certificación
        </Text>

        {/* Marco central */}
        <View
          style={{
            width: 260,
            height: 260,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#1F2937',
            backgroundColor: 'rgba(0,0,0,0.25)',
          }}
        >
          {/* Esquinas Pineal */}
          <View style={cornerStyle('topLeft')} />
          <View style={cornerStyle('topRight')} />
          <View style={cornerStyle('bottomLeft')} />
          <View style={cornerStyle('bottomRight')} />
        </View>
      </View>
    </View>
  );
}
