import React, { useState, useCallback } from 'react';
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

import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/RootNavigator';

import { parseIdentifier } from '@/utils/parseIdentifier';
import { colors, spacing } from '@/theme';

type Nav =
  NativeStackNavigationProp<
    RootStackParamList,
    'Scan'
  >;

export function ScanScreen() {
  const navigation = useNavigation<Nav>();

  const device = useCameraDevice('back');

  const {
    hasPermission,
    requestPermission,
  } = useCameraPermission();

  // evita múltiples lecturas seguidas
  const [hasScanned, setHasScanned] =
    useState(false);

  // cada vez que entras a la pantalla, rearmamos scanner
  useFocusEffect(
    useCallback(() => {
      setHasScanned(false);
    }, [])
  );

  /**
   * Callback seguro:
   * - evita doble scan
   * - protege parseIdentifier
   * - nunca rompe navegación
   */
  const onCodeScanned = (raw: string) => {
    if (hasScanned) return;

    setHasScanned(true);

    try {
      const identifier =
        parseIdentifier(raw);

      // QR externo / no Pineal Shield
      if (!identifier) {
        navigation.replace(
          'Result',
          { status: 'invalid' }
        );
        return;
      }

      // QR válido
      navigation.replace(
        'Result',
        {
          status: 'scanned',
          raw: identifier,
        }
      );
    } catch (error) {
      // fallback seguro
      navigation.replace(
        'Result',
        { status: 'invalid' }
      );
    }
  };

  const codeScanner =
    useCodeScanner({
      codeTypes: ['qr'],
      onCodeScanned: codes => {
        const value =
          codes?.[0]?.value;

        if (value) {
          onCodeScanned(value);
        }
      },
    });

  // Cámara no encontrada
  if (!device) {
    return (
      <CenteredBlock
        title="Cámara no disponible"
        subtitle="No fue posible inicializar el módulo de cámara."
      />
    );
  }

  // Sin permiso aún
  if (!hasPermission) {
    return (
      <CenteredBlock
        title="Acceso requerido"
        subtitle="PinealID utiliza la cámara para consultar registros certificados dentro de la infraestructura Pineal Shield."
        buttonText="Conceder acceso"
        onPress={requestPermission}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
      />

      <Camera
        style={
          StyleSheet.absoluteFill
        }
        device={device}
        isActive={!hasScanned}
        codeScanner={codeScanner}
      />

      <View style={styles.dimTop} />
      <View
        style={styles.dimBottom}
      />

      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          BY PINEAL SHIELD
        </Text>

        <Text style={styles.title}>
          Consultar registro
        </Text>

        <Text
          style={styles.subtitle}
        >
          Consulta evidencia digital asociada a un registro verificado Pineal Shield
        </Text>
      </View>

      <View
        style={styles.centerArea}
      >
        <View style={styles.frame}>
          <Corner pos="tl" />
          <Corner pos="tr" />
          <Corner pos="bl" />
          <Corner pos="br" />
        </View>
      </View>

      <View style={styles.footer}>
        <Text
          style={styles.footerText}
        >
          Consulta institucional segura en tiempo real
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
    <View
      style={
        styles.blockContainer
      }
    >
      <Image
        source={require('@/assets/images/pinealid-logo.png')}
        style={styles.logo}
      />

      <Text
        style={styles.blockTitle}
      >
        {title}
      </Text>

      <Text
        style={styles.blockText}
      >
        {subtitle}
      </Text>

      {buttonText &&
      onPress ? (
        <Pressable
          onPress={onPress}
          style={({
            pressed,
          }) => [
            styles.button,
            pressed && {
              opacity: 0.9,
            },
          ]}
        >
          <Text
            style={
              styles.buttonText
            }
          >
            {buttonText}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Corner({
  pos,
}: {
  pos:
    | 'tl'
    | 'tr'
    | 'bl'
    | 'br';
}) {
  const styleMap = {
    tl: styles.tl,
    tr: styles.tr,
    bl: styles.bl,
    br: styles.br,
  };

  return (
    <View
      style={[
        styles.corner,
        styleMap[pos],
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      '#000',
  },

  dimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '22%',
    backgroundColor:
      'rgba(0,0,0,0.55)',
  },

  dimBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '28%',
    backgroundColor:
      'rgba(0,0,0,0.58)',
  },

  header: {
    position: 'absolute',
    top: 82,
    left: 24,
    right: 24,
    alignItems:
      'center',
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
    textAlign: 'center',
  },

  centerArea: {
    flex: 1,
    justifyContent:
      'center',
    alignItems:
      'center',
  },

  frame: {
    width: 292,
    height: 292,
    borderRadius: 22,
    backgroundColor:
      'rgba(255,255,255,0.015)',
    borderWidth: 1,
    borderColor:
      'rgba(20,255,210,0.08)',
  },

  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor:
      colors.primary,
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
    alignItems:
      'center',
  },

  footerText: {
    color: '#d1d5db',
    fontSize: 12,
  },

  blockContainer: {
    flex: 1,
    backgroundColor:
      colors.background,
    justifyContent:
      'center',
    alignItems:
      'center',
    paddingHorizontal:
      spacing.lg,
  },

  logo: {
    width: 84,
    height: 84,
    marginBottom: 20,
  },

  blockTitle: {
    color:
      colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },

  blockText: {
    color:
      colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 22,
  },

  button: {
    backgroundColor:
      colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },

  buttonText: {
    color: '#05110e',
    fontWeight: '700',
  },
});