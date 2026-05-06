import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  Linking,
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
        Marco operativo y documental del entorno PinealID.
      </Text>

      <Section
        title="Aviso de Privacidad"
        body={`PinealID procesa información técnica mínima necesaria para operar consultas seguras de registros certificados, proteger integridad operativa y mantener trazabilidad del entorno.

La aplicación no tiene como finalidad principal recopilar información personal sensible.`}
      />

      <Section
        title="Uso de Cámara"
        body={`La cámara es utilizada exclusivamente para consultar identificadores emitidos dentro de la infraestructura Pineal Shield.

Las imágenes capturadas no son almacenadas permanentemente como contenido fotográfico del usuario.`}
      />

      <Section
        title="Términos de Uso"
        body={`PinealID funciona como interfaz de consulta para registros emitidos dentro de la infraestructura Pineal Shield.

Los resultados reflejan exclusivamente el estado digital del registro consultado al momento de la consulta.

La aplicación no valida directamente la condición física del producto ni garantiza su autenticidad fuera del registro digital.`}
      />

      <Section
        title="Limitación"
        body={`Los resultados presentados representan evidencia digital basada en registros existentes en Pineal Shield.

Pineal Shield no asume responsabilidad por el uso, interpretación o decisiones tomadas a partir de dichos resultados, ni por condiciones externas al sistema como manipulación física, falsificación externa o uso indebido del registro o activo asociado.

La verificación no sustituye procesos legales, comerciales, notariales o periciales independientes cuando estos sean requeridos.`}
      />

      {/* 🔹 NUEVA SECCIÓN CRÍTICA */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Documentación institucional
        </Text>

        <Text style={styles.cardBody}>
          Consulta documentación vigente:
        </Text>

        <Pressable
          onPress={() =>
            Linking.openURL('https://www.pinealshield.com/pinealid/terms')
          }
        >
          <Text style={styles.link}>
            Términos de uso
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            Linking.openURL('https://www.pinealshield.com/pinealid/privacy')
          }
        >
          <Text style={styles.link}>
            Aviso de privacidad
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>
          PinealID {ENV.APP_VERSION}
        </Text>

        <Text style={styles.build}>
          Infrastructure Layer · {ENV.BUILD_VERSION}
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
    marginTop: 34,
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
    borderColor:  '#1a2230',
    backgroundColor: '#0b1018',
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

  link: {
    color: colors.primary,
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
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