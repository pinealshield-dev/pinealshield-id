import React from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
} from 'react-native'

import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/RootNavigator'
import { ENV } from '@/config/env';

import { colors, spacing } from '@/theme'

type Nav =
  NativeStackNavigationProp<
    RootStackParamList,
    'Offline'
  >

export function OfflineScreen() {
  const navigation = useNavigation<Nav>()

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />

      <Image
        source={require('@/assets/images/pinealid-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.eyebrow}>
        BY PINEAL SHIELD
      </Text>

      <Text style={styles.title}>
        Conexión no disponible
      </Text>

      <Text style={styles.subtitle}>
        La consulta institucional requiere conectividad activa.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>
          Entorno operativo
        </Text>

        <Text style={styles.cardTitle}>
          CONSULTA NO DISPONIBLE
        </Text>

        <Text style={styles.cardBody}>
          PinealID requiere conectividad para consultar evidencia certificada y obtener el estado actual del registro solicitado.
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>
          Reanudar consulta
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        Infrastructure Layer · {ENV.BUILD_VERSION}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 110,
    paddingHorizontal: spacing.lg,
  },

  logo: {
    width: 82,
    height: 82,
    marginBottom: 18,
    opacity: 0.95,
  },

  eyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 2.6,
    marginBottom: 14,
  },

  title: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 22,
  },

  card: {
    width: '100%',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1a2230',
    backgroundColor: '#0b1018',
    padding: 22,
    marginBottom: 24,
  },

  cardLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },

  cardTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },

  cardBody: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },

  button: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 18,
  },

  buttonPressed: {
    opacity: 0.88,
  },

  buttonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },

  footer: {
    position: 'absolute',
    bottom: 24,
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
  },
})