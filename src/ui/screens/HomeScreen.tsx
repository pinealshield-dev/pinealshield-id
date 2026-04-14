import React from 'react';
import { ENV } from '@/config/env';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { colors, spacing } from '@/theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />

      <View style={styles.hero}>
        <Image
          source={require('@/assets/images/pinealid-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.eyebrow}>
          PINEAL SHIELD REGISTRY
        </Text>

        <Text style={styles.title}>
          PinealID
        </Text>

        <Text style={styles.subtitle}>
          Official verification client for Pineal Shield records.
        </Text>
      </View>

      <Pressable
        onPress={() => navigation.navigate('Scan')}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.primaryButtonPressed,
        ]}
      >
        <Text style={styles.primaryButtonText}>
          Escanear certificación
        </Text>
      </Pressable>

      <Text style={styles.helperText}>
        Escanea un código oficial para validar existencia, estado e integridad del registro.
      </Text>

      <View style={styles.trustCard}>
        <Text style={styles.trustTitle}>
          Verificación institucional
        </Text>

        <Text style={styles.trustBody}>
          PinealID consulta directamente la infraestructura de Pineal Shield y muestra el estado actual del registro verificado.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>
          PinealID {ENV.APP_VERSION}
        </Text>

        <Text style={styles.build}>
          Verification Layer · {ENV.BUILD_VERSION}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  hero: {
    alignItems: 'center',
    marginBottom: 36,
    marginTop: 12,
  },

  logo: {
    width: 92,
    height: 92,
    marginBottom: 20,
  },

  eyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 2.6,
    marginBottom: 10,
  },

  title: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 10,
  },

  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 310,
  },

  primaryButton: {
    minWidth: 250,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 18,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },

  primaryButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },

  primaryButtonText: {
    color: '#03110e',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },

  helperText: {
    marginTop: 16,
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
  },

  trustCard: {
    width: '100%',
    marginTop: 28,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 18,
  },

  trustTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  trustBody: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },

  footer: {
    position: 'absolute',
    bottom: 18,
    alignItems: 'center',
  },

  version: {
    color: colors.textMuted,
    fontSize: 11,
  },

  build: {
    color: colors.textMuted,
    opacity: 0.72,
    fontSize: 10,
    marginTop: 3,
    letterSpacing: 0.35,
  },
});