import React, { useEffect, useState } from 'react';
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
import { colors, spacing } from '@/theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Scan'>;

export function ScanScreen() {
  const navigation = useNavigation<Nav>();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } =
    useCameraPermission();

  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  const onCodeScanned = (raw: string) => {
    if (hasScanned) return;

    setHasScanned(true);

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
      const value = codes?.[0]?.value;
      if (value) onCodeScanned(value);
    },
  });

  if (!device) {
    return (
      <CenteredBlock
        title="Cámara no disponible"
        subtitle="No fue posible acceder al módulo de cámara."
      />
    );
  }

  if (!hasPermission) {
    return (
      <CenteredBlock
        title="Acceso requerido"
        subtitle="PinealID necesita acceso a cámara para leer certificaciones oficiales."
        buttonText="Conceder acceso"
        onPress={requestPermission}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!hasScanned}
        codeScanner={codeScanner}
      />

      <View style={styles.dimTop} />
      <View style={styles.dimBottom} />

      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          PINEAL SHIELD REGISTRY
        </Text>

        <Text style={styles.title}>
          Escanear certificación
        </Text>

        <Text style={styles.subtitle}>
          Alinea el código dentro del marco
        </Text>
      </View>

      <View style={styles.centerArea}>
        <View style={styles.frame}>
          <Corner pos="tl" />
          <Corner pos="tr" />
          <Corner pos="bl" />
          <Corner pos="br" />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Verificación directa contra Pineal Shield
        </Text>
      </View>
    </View>
  );
}

function CenteredBlock({
  title,
  subtitle,
  buttonText,
  onPress,
}: {
  title: string;
  subtitle: string;
  buttonText?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.blockContainer}>
      <Image
        source={require('@/assets/images/pinealid-logo.png')}
        style={styles.logo}
      />

      <Text style={styles.blockTitle}>{title}</Text>
      <Text style={styles.blockText}>{subtitle}</Text>

      {buttonText && onPress && (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={styles.buttonText}>
            {buttonText}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function Corner({
  pos,
}: {
  pos: 'tl' | 'tr' | 'bl' | 'br';
}) {
  const styleMap = {
    tl: styles.tl,
    tr: styles.tr,
    bl: styles.bl,
    br: styles.br,
  };

  return <View style={[styles.corner, styleMap[pos]]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  dimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '22%',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  dimBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '28%',
    backgroundColor: 'rgba(0,0,0,0.58)',
  },

  header: {
    position: 'absolute',
    top: 58,
    left: 24,
    right: 24,
    alignItems: 'center',
  },

  eyebrow: {
    color: '#9ca3af',
    fontSize: 10,
    letterSpacing: 2.4,
    marginBottom: 8,
  },

  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },

  subtitle: {
    color: '#d1d5db',
    fontSize: 13,
    marginTop: 8,
  },

  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  frame: {
    width: 270,
    height: 270,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: colors.primary,
  },

  tl: {
    top: -1,
    left: -1,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },

  tr: {
    top: -1,
    right: -1,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },

  bl: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },

  br: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },

  footer: {
    position: 'absolute',
    bottom: 34,
    left: 20,
    right: 20,
    alignItems: 'center',
  },

  footerText: {
    color: '#d1d5db',
    fontSize: 12,
  },

  blockContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },

  logo: {
    width: 84,
    height: 84,
    marginBottom: 20,
  },

  blockTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },

  blockText: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 22,
  },

  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },

  buttonText: {
    color: '#05110e',
    fontWeight: '700',
  },
});