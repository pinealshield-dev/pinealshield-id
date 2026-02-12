import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
} from 'react-native';

import { colors, spacing, typography } from '@/theme';

export function OfflineScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <Image
        source={require('@/assets/images/pinealid-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={[styles.title, typography.title]}>
        Sin conexión segura
      </Text>

      <Text style={[styles.subtitle, typography.body]}>
        La verificación criptográfica requiere acceso a red.
      </Text>

      <Text style={styles.description}>
        PinealID necesita conectividad para validar el registro
        contra la infraestructura privada de Pineal Shield.
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => {
          // Aquí puedes redirigir a Scan o Home si quieres
        }}
      >
        <Text style={styles.buttonText}>
          Reintentar verificación
        </Text>
      </Pressable>

      <Text style={styles.version}>
        PinealID · 2026.02
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },

  logo: {
    width: 72,
    height: 72,
    marginBottom: spacing.lg,
    opacity: 0.9,
  },

  title: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  subtitle: {
    color: colors.textSecondary,
    opacity: 0.8,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  description: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 18,
  },

  button: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonText: {
    color: colors.primary,
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
});
