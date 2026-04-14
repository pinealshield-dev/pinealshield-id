import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';

import { ENV } from '@/config/env';
import { colors, spacing } from '@/theme';

export function LegalScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />

      <Text style={styles.eyebrow}>
        PINEAL SHIELD REGISTRY
      </Text>

      <Text style={styles.title}>
        Privacidad y Legal
      </Text>

      <Text style={styles.subtitle}>
        Información institucional del cliente móvil PinealID.
      </Text>

      <Section
        title="Aviso de Privacidad"
        body="PinealID no recopila datos personales identificables del usuario final como finalidad principal. La aplicación puede registrar eventos técnicos de verificación, identificadores de dispositivo y contexto operativo para seguridad, trazabilidad e integridad del sistema."
      />

      <Section
        title="Uso de Cámara"
        body="La cámara se utiliza únicamente para lectura de códigos de certificación. No se almacenan fotografías, video ni contenido visual capturado durante la verificación."
      />

      <Section
        title="Términos de Uso"
        body="PinealID es una superficie de consulta dentro de la infraestructura Pineal Shield. Los resultados mostrados reflejan el estado actual del registro consultado y, cuando aplique, señales técnicas de integridad criptográfica."
      />

      <Section
        title="Limitación"
        body="La verificación mostrada no sustituye revisiones legales, comerciales, notariales, contractuales o periciales externas."
      />

      <View style={styles.footer}>
        <Text style={styles.version}>
          PinealID {ENV.APP_VERSION}
        </Text>

        <Text style={styles.build}>
          Verification Layer · {ENV.BUILD_VERSION}
        </Text>
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },

  eyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 2.4,
    marginTop: 8,
    marginBottom: 10,
  },

  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 22,
  },

  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 18,
    marginBottom: 14,
  },

  cardTitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },

  cardBody: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 21,
  },

  footer: {
    marginTop: 16,
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
  },
});