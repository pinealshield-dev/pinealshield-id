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

      <Text style={styles.eyebrow}>
        BY PINEAL SHIELD
      </Text>

      <Text style={styles.title}>Cuenta</Text>

      <Text style={styles.subtitle}>
        Cliente móvil oficial para verificar y gestionar activos autenticados.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          Identidad
        </Text>

        <Text style={styles.valueBig}>
          PinealID
        </Text>

        <Text style={styles.descSmall}>
          Superficie móvil para verificar, consultar
          y administrar activos autenticados.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          Estado del ecosistema
        </Text>

        <Text style={styles.statusOk}>
          CONECTADO
        </Text>

        <Text style={styles.desc}>
          Cliente enlazado con la infraestructura
          de verificación Pineal Shield Registry.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          Mis activos
        </Text>

        <Text style={styles.value}>
          Próxima capa disponible
        </Text>

        <Text style={styles.desc}>
          Aquí podrás visualizar productos,
          certificados y activos verificados
          asociados a tu cuenta.
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
        <Text style={styles.sectionLabel}>
          Metadata técnica
        </Text>

        <Text style={styles.meta}>
          App · PinealID 1.0.4
        </Text>

        <Text style={styles.meta}>
          Verification Layer · 2026.02
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
    fontSize: 10,
    letterSpacing: 2.5,
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
    marginBottom: 24,
  },

  card: {
    backgroundColor: '#0b1018',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1a2230',
    padding: 22,
    marginBottom: 18,
  },

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 10,
  },

  valueBig: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },

  value: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },

  statusOk: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },

  desc: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },

  descSmall: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },

  button: {
    backgroundColor: '#080808',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1a2230',
    paddingVertical: 18,
    paddingHorizontal: 22,
    marginBottom: 18,
  },

  pressed: {
    opacity: 0.85,
  },

  buttonText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
  },

  meta: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
})