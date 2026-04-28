import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'

import NetInfo from '@react-native-community/netinfo'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import type { AccountStackParamList } from '@/navigation/AccountStack'
import { colors, spacing } from '@/theme'
import { ENV } from '@/config/env'
import { getDeviceId } from '@/security/deviceIdentity'

type Nav =
  NativeStackNavigationProp<
    AccountStackParamList,
    'AccountHome'
  >

export function AccountScreen() {
  const navigation = useNavigation<Nav>()

  const [deviceId, setDeviceId] = useState('...')
  const [isOnline, setIsOnline] = useState<boolean | null>(null)

  useEffect(() => {
    refreshDiagnostics()

    const unsubscribe = NetInfo.addEventListener(state => {
      const connected =
        Boolean(state.isConnected) &&
        Boolean(state.isInternetReachable ?? true)

      setIsOnline(connected)
    })

    return unsubscribe
  }, [])

  async function refreshDiagnostics() {
    const id = await getDeviceId()
    setDeviceId(id)
  }

  function copyDeviceId() {
    Clipboard.setString(deviceId)
    Alert.alert(
      'Copiado',
      'Identificador de dispositivo copiado.'
    )
  }

  const shortId =
    deviceId.length > 18
      ? `${deviceId.slice(0, 8)}...${deviceId.slice(-6)}`
      : deviceId

  const networkLabel =
    isOnline === null
      ? 'VERIFICANDO'
      : isOnline
      ? 'CONECTADO'
      : 'OFFLINE'

  const networkColor =
    isOnline === null
      ? colors.textMuted
      : isOnline
      ? colors.primary
      : '#ff8a65'

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
        Cuenta
      </Text>

      <Text style={styles.subtitle}>
        Identidad local, dispositivo confiable y acceso
        progresivo al ecosistema Pineal Shield.
      </Text>

      {/* IDENTIDAD */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          Identidad
        </Text>

        <Text style={styles.valueBig}>
          PinealID
        </Text>

        <Text style={styles.descSmall}>
          Cliente móvil institucional para
          verificación y futura gestión de activos
          autenticados.
        </Text>
      </View>

      {/* RED */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          Estado del ecosistema
        </Text>

        <Text
          style={[
            styles.status,
            { color: networkColor },
          ]}
        >
          {networkLabel}
        </Text>

        <Text style={styles.desc}>
          {isOnline
            ? 'Conectividad disponible con servicios de verificación Pineal Shield.'
            : 'Sin acceso a red. Las verificaciones remotas requieren conexión.'}
        </Text>
      </View>

      {/* DEVICE */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          Dispositivo confiable
        </Text>

        <Text style={styles.value}>
          {shortId}
        </Text>

        <Text style={styles.desc}>
          Identificador persistente usado para
          trazabilidad técnica y futuras capas
          de seguridad.
        </Text>

        <View style={styles.row}>
          <Pressable
            style={styles.secondaryButton}
            onPress={copyDeviceId}
          >
            <Text style={styles.secondaryText}>
              Copiar ID
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={refreshDiagnostics}
          >
            <Text style={styles.secondaryText}>
              Refresh
            </Text>
          </Pressable>
        </View>
      </View>

      {/* CUENTA */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          Cuenta PinealID
        </Text>

        <Text style={styles.value}>
          NO VINCULADA
        </Text>

        <Text style={styles.desc}>
          Operas en modo local seguro. La siguiente fase
          habilitará acceso autenticado, sincronización
          de dispositivos y sesiones confiables.
        </Text>

        <Pressable style={styles.buttonDisabled}>
          <Text style={styles.buttonDisabledText}>
            Próximamente · Acceso Seguro
          </Text>
        </Pressable>
      </View>

      {/* ACTIVOS */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          Mis activos
        </Text>

        <Text style={styles.value}>
          CAPA PREPARADA
        </Text>

        <Text style={styles.desc}>
          Aquí vivirán productos vinculados, garantías,
          certificados, propiedad digital y futuras
          transferencias verificables.
        </Text>

        <Pressable style={styles.buttonDisabled}>
          <Text style={styles.buttonDisabledText}>
            Próximamente · Ecosistema Personal
          </Text>
        </Pressable>
      </View>

      {/* LEGAL */}
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

      {/* METADATA */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          Metadata técnica
        </Text>

        <Text style={styles.meta}>
          App · PinealID {ENV.APP_VERSION}
        </Text>

        <Text style={styles.meta}>
          Verification Layer · {ENV.BUILD_VERSION}
        </Text>

        <Text style={styles.meta}>
          Host · verify.pinealshield.com
        </Text>

        <Text style={styles.meta}>
          Mode · Identity Edge Client
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
    paddingBottom: 90,
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
    lineHeight: 22,
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

  status: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },

  desc: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 14,
  },

  descSmall: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
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

  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a2230',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#070b12',
  },

  secondaryText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  buttonDisabled: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a2230',
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: '#070707',
    opacity: 0.7,
  },

  buttonDisabledText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '700',
  },

  meta: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
})