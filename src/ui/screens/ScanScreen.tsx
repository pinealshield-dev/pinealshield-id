// src/ui/screens/ScanScreen.tsx

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/navigation/RootNavigator';
import { parseIdentifier } from '@/utils/parseIdentifier';
import { colors, spacing, typography } from '@/theme';

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

  /* =======================================
     CAMERA NOT AVAILABLE
  ======================================= */

  if (!device) {
    return (
      <CenteredBlock
        title="Cámara no disponible"
        subtitle="No fue posible acceder al dispositivo de cámara."
      />
    );
  }

  /* =======================================
     PERMISSION SCREEN (Premium)
  ======================================= */

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
        />

        <Image
          source={require('@/assets/images/pinealid-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={[styles.title, typography.title]}>
          Acceso a cámara requerido
        </Text>

        <Text style={[styles.subtitle, typography.body]}>
          PinealID necesita acceso a la cámara para
          verificar certificaciones digitales.
        </Text>

        <Pressable
          onPress={requestPermission}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>
            Conceder acceso
          </Text>
        </Pressable>

        <Text style={styles.version}>
          PinealID · 2026.02
        </Text>
      </View>
    );
  }

  /* =======================================
     CAMERA ACTIVE
  ======================================= */

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Camera
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />

      <View style={styles.overlay} pointerEvents="none">
        <Text style={styles.scanTitle}>
          Escanea el código de certificación
        </Text>

        <View style={styles.scanFrame}>
          <View style={cornerStyle('topLeft')} />
          <View style={cornerStyle('topRight')} />
          <View style={cornerStyle('bottomLeft')} />
          <View style={cornerStyle('bottomRight')} />
        </View>
      </View>
    </View>
  );
}

/* =======================================
   REUSABLE CENTERED BLOCK
======================================= */

function CenteredBlock({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.permissionContainer}>
      <Text style={[styles.title, typography.title]}>
        {title}
      </Text>
      <Text style={[styles.subtitle, typography.body]}>
        {subtitle}
      </Text>
    </View>
  );
}

/* =======================================
   STYLES
======================================= */

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },

  logo: {
    width: 88,
    height: 88,
    marginBottom: spacing.lg,
  },

  title: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  subtitle: {
    color: colors.textSecondary,
    opacity: 0.75,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonText: {
    color: '#000',
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  version: {
    position: 'absolute',
    bottom: 24,
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scanTitle: {
    position: 'absolute',
    top: 80,
    color: '#F3F4F6',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  scanFrame: {
    width: 260,
    height: 260,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
});

const cornerStyle = (
  position:
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight',
) => {
  const base = {
    position: 'absolute' as const,
    width: 28,
    height: 28,
    borderColor: colors.primary,
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
