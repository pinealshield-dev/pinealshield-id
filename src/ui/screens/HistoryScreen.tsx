import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '@/theme';

export function HistoryScreen() {
  const navigation = useNavigation<any>();

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
        BY PINEAL SHIELD
      </Text>

      <Text style={styles.title}>
        Historial
      </Text>

      <Text style={styles.subtitle}>
        Registro local de actividad y verificaciones recientes.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          Estado
        </Text>

        <Text style={styles.emptyTitle}>
          SIN ACTIVIDAD REGISTRADA
        </Text>

        <Text style={styles.cardBody}>
          Aún no existen verificaciones guardadas en este dispositivo.
          Cada consulta realizada desde PinealID podrá reflejarse aquí.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate('Verificar')}
        >
          <Text style={styles.buttonText}>
            Nueva verificación
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          Trazabilidad
        </Text>

        <Text style={styles.infoText}>
          El historial local evolucionará hacia sincronización segura,
          continuidad entre dispositivos y evidencia de actividad.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          Metadata técnica
        </Text>

        <Text style={styles.meta}>
          Storage · Local Device
        </Text>

        <Text style={styles.meta}>
          Sync Layer · Próximamente
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: 80,
  },

  eyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 2.4,
    marginTop: 10,
    marginBottom: 14,
  },

  title: {
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 8,
  },

  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 22,
  },

  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1a2230',
    backgroundColor: '#0b1018',
    padding: 22,
    marginBottom: 18,
  },

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 10,
  },

  emptyTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },

  cardBody: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 18,
  },

  infoText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },

  button: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 20,
  },

  buttonPressed: {
    opacity: 0.88,
  },

  buttonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },

  meta: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
});