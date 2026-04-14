import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '@/theme';

export function HistoryScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />

      <Text style={styles.eyebrow}>
        PINEAL SHIELD REGISTRY
      </Text>

      <Text style={styles.title}>
        Historial
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Sin actividad registrada
        </Text>

        <Text style={styles.cardBody}>
          Aún no hay verificaciones registradas en este dispositivo para mostrar en el historial local.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate('Verificar')}
        >
          <Text style={styles.buttonText}>
            Ir a verificar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: 48,
  },

  eyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 2.2,
    marginBottom: 10,
  },

  title: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
  },

  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 18,
  },

  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  cardBody: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 18,
  },

  button: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  buttonPressed: {
    opacity: 0.9,
  },

  buttonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});