// src/ui/screens/LegalScreen.tsx

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';

import { colors, spacing, typography } from '@/theme';

export function LegalScreen() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <Text style={[styles.title, typography.title]}>
        Información Legal
      </Text>

      <Text style={styles.sectionTitle}>
        Aviso de Privacidad
      </Text>

      <Text style={styles.text}>
        PinealID no recopila datos personales identificables.
        La cámara se utiliza exclusivamente para la lectura de códigos QR.
        No se almacenan imágenes ni historial de verificaciones.
      </Text>

      <Text style={styles.sectionTitle}>
        Términos de Uso
      </Text>

      <Text style={styles.text}>
        PinealID es una herramienta de verificación digital
        dentro de la infraestructura Pineal Shield®.
        No sustituye validaciones legales o contractuales.
      </Text>

      <Text style={styles.version}>
        PinealID · 2026.02
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },

  title: {
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    color: colors.primary,
    fontSize: 14,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  text: {
    color: colors.textSecondary,
    lineHeight: 20,
    fontSize: 13,
  },

  version: {
    marginTop: spacing.xl,
    color: colors.textMuted,
    fontSize: 11,
  },
});
