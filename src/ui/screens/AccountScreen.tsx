import React from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native'

import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import type { AccountStackParamList } from '@/navigation/AccountStack'
import { colors, spacing } from '@/theme'

type Nav =
  NativeStackNavigationProp<
    AccountStackParamList,
    'AccountHome'
  >

export function AccountScreen() {
  const navigation = useNavigation<Nav>()

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

      <Text style={styles.eyebrow}>PINEALID</Text>
      <Text style={styles.title}>Cuenta</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Aplicación</Text>
        <Text style={styles.value}>PinealID 1.0.3</Text>

        <Text style={[styles.label, styles.mt]}>
          Capa institucional
        </Text>
        <Text style={styles.value}>
          Verification Layer · 2026.02
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
        ]}
        onPress={() => navigation.navigate('Legal')}
      >
        <Text style={styles.buttonText}>
          Privacidad y Legal
        </Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.valueTitle}>
          Estado del cliente
        </Text>

        <Text style={styles.desc}>
          Cliente móvil conectado a la
          infraestructura de verificación
          Pineal Shield.
        </Text>
      </View>
    </ScrollView>
  )
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
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 10,
    marginBottom: 16,
  },

  title: {
    color: colors.textPrimary,
    fontSize: 42,
    fontWeight: '600',
    marginBottom: 28,
  },

  card: {
    backgroundColor: '#0b1018',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1a2230',
    padding: 22,
    marginBottom: 20,
  },

  label: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 6,
  },

  value: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },

  mt: {
    marginTop: 18,
  },

  button: {
    backgroundColor: '#080808',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1a2230',
    paddingVertical: 20,
    paddingHorizontal: 22,
    marginBottom: 20,
  },

  pressed: {
    opacity: 0.85,
  },

  buttonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },

  valueTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },

  desc: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 28,
  },
})