import React, { useEffect } from 'react'
import { registerSecurityEvent } from '@/services/securityEventsClient'
import { ENV } from '@/config/env'
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native'

import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import type { RootStackParamList } from '../../navigation/RootNavigator'
import { colors, spacing } from '@/theme'

type Nav = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>

export function HomeScreen() {
  const navigation = useNavigation<Nav>()

  useEffect(() => {
    registerSecurityEvent('app_opened')
  }, [])

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
          BY PINEAL SHIELD
        </Text>

        <Text style={styles.title}>
          PinealID
        </Text>

        <Text style={styles.subtitle}>
          Consulta registros verificados y evidencia digital asociada.
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
          Consultar registro
        </Text>
      </Pressable>

      <Text style={styles.helperText}>
        Consulta el estado y evidencia asociada a registros emitidos dentro de Pineal Shield.
      </Text>

      <View style={styles.trustCard}>
        <Text style={styles.cardLabel}>
          Verification Layer
        </Text>

        <Text style={styles.trustTitle}>
          Infraestructura de integridad digital
        </Text>

        <Text style={styles.trustBody}>
          Cada consulta refleja el estado y evidencia disponible del registro dentro de Pineal Shield.
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 96,
  },

  hero: {
    alignItems: 'center',
    marginBottom: 34,
    marginTop: 10,
  },

  logo: {
    width: 96,
    height: 96,
    marginBottom: 20,
    opacity: 0.96,
  },

  eyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 2.8,
    marginBottom: 10,
  },

  title: {
    color: colors.textPrimary,
    fontSize: 38,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.3,
  },

  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },

  primaryButton: {
    minWidth: 270,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 17,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: '#14c38b',
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
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
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1a2230',
    backgroundColor: '#0b1018',
    padding: 22,
  },

  cardLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 8,
    letterSpacing: 1,
  },

  trustTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },

  trustBody: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
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
})