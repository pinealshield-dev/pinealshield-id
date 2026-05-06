import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native'

import Clipboard from '@react-native-clipboard/clipboard'
import NetInfo from '@react-native-community/netinfo'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import {
  getDeviceTrust,
  type DeviceTrustResult,
} from '@/services/deviceTrustClient'

import type { AccountStackParamList } from '@/navigation/AccountStack'
import { colors, spacing } from '@/theme'
import { ENV } from '@/config/env'
import { getDeviceId } from '@/security/deviceIdentity'

import {
  requestAccess,
  confirmAccess,
  getMobileIdentity,
} from '@/services/mobileAccessClient'

import {
  refreshMobileSession,
  logoutMobileSession,
} from '@/services/mobileSessionClient'

type Nav =
  NativeStackNavigationProp<
    AccountStackParamList,
    'AccountHome'
  >

type IdentityState = {
  linked: boolean
  email: string | null
  expires_at?: string | null
}

export function AccountScreen() {
  const navigation = useNavigation<Nav>()

  const [deviceId, setDeviceId] = useState('...')
  const [isOnline, setIsOnline] =
    useState<boolean | null>(null)

  const [identity, setIdentity] =
    useState<IdentityState>({
      linked: false,
      email: null,
      expires_at: null,
    })

  const [trust, setTrust] =
    useState<DeviceTrustResult | null>(null)

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] =
    useState(false)
  const [loading, setLoading] =
    useState(false)

  useEffect(() => {
    boot()

    const unsubscribe =
      NetInfo.addEventListener(state => {
        const connected =
          Boolean(state.isConnected) &&
          Boolean(
            state.isInternetReachable ?? true
          )

        setIsOnline(connected)
      })

    return unsubscribe
  }, [])

  async function boot() {
    await refreshDiagnostics()

    try {
      const trustData =
        await getDeviceTrust()

      setTrust(trustData)
    } catch {}

    try {
      await refreshMobileSession()
    } catch {}

    await loadIdentity()
  }

  async function refreshDiagnostics() {
    const id = await getDeviceId()
    setDeviceId(id)
  }

  async function loadIdentity() {
    try {
      const data =
        await getMobileIdentity()

      const linked = Boolean(data?.linked)

      setIdentity({
        linked,
        email: data?.email ?? null,
        expires_at:
          data?.expires_at ?? null,
      })

      if (linked) {
        setEmail(data?.email ?? '')
        setCode('')
        setCodeSent(false)
      }
    } catch {
      setIdentity({
        linked: false,
        email: null,
        expires_at: null,
      })
    }
  }

  async function handleRequestAccess() {
    try {
      setLoading(true)

      if (!email.trim()) {
        Alert.alert(
          'Correo requerido',
          'Ingresa un correo válido.'
        )
        return
      }

      const res =
        await requestAccess(email)

      setCode('')
      setCodeSent(true)

      Alert.alert(
        'Código enviado',
        res?.dev_code
          ? `DEV CODE: ${res.dev_code}`
          : 'Revisa tu correo.'
      )
    } catch (error: any) {
      const msg =
        error?.message ?? 'unknown'

      if (msg.includes('rate_limited')) {
        Alert.alert(
          'Límite temporal',
          'Espera unos minutos antes de intentarlo nuevamente.'
        )
      } else if (
        msg.includes('invalid_email')
      ) {
        Alert.alert(
          'Correo inválido',
          'Verifica el correo ingresado.'
        )
      } else {
        Alert.alert(
          'No disponible',
          'No fue posible enviar el código.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm() {
    try {
      if (!email.trim() || !code.trim()) {
        Alert.alert(
          'Datos incompletos',
          'Ingresa correo y código.'
        )
        return
      }

      setLoading(true)

      await confirmAccess(email, code)
      await loadIdentity()

      setCode('')
      setCodeSent(false)

      Alert.alert(
        'Acceso concedido',
        'Tu dispositivo quedó vinculado correctamente.'
      )
    } catch (error: any) {
      const msg =
        error?.message ?? 'unknown'

      if (msg.includes('invalid_code')) {
        Alert.alert(
          'Código incorrecto',
          'El código ingresado no es válido.'
        )
      } else if (
        msg.includes(
          'challenge_expired'
        )
      ) {
        Alert.alert(
          'Código vencido',
          'Solicita uno nuevo.'
        )
      } else if (
        msg.includes(
          'challenge_blocked'
        )
      ) {
        Alert.alert(
          'Acceso bloqueado',
          'Demasiados intentos fallidos.'
        )
      } else if (
        msg.includes(
          'challenge_not_found'
        )
      ) {
        Alert.alert(
          'Sin solicitud activa',
          'Solicita un nuevo código.'
        )
      } else {
        Alert.alert(
          'No disponible',
          'No fue posible validar acceso.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    try {
      setLoading(true)

      await logoutMobileSession()

      setIdentity({
        linked: false,
        email: null,
        expires_at: null,
      })

      setCode('')
      setCodeSent(false)

      Alert.alert(
        'Sesión cerrada',
        'El dispositivo volvió a modo local.'
      )
    } catch {
      Alert.alert(
        'Error',
        'No fue posible cerrar sesión.'
      )
    } finally {
      setLoading(false)
    }
  }

  function copyDeviceId() {
    Clipboard.setString(deviceId)

    Alert.alert(
      'Copiado',
      'Referencia copiada.'
    )
  }

  const shortId =
    deviceId.length > 18
      ? `${deviceId.slice(
          0,
          8
        )}...${deviceId.slice(-6)}`
      : deviceId

  const networkLabel =
    isOnline === null
      ? 'VERIFICANDO'
      : isOnline
      ? 'OPERATIVO'
      : 'SIN CONEXIÓN'

  const networkColor =
    isOnline === null
      ? colors.textMuted
      : isOnline
      ? colors.primary
      : '#ff8a65'

  const trustLabel =
    trust?.riskLevel === 'high'
      ? 'LIMITADO'
      : trust?.riskLevel === 'medium'
      ? 'REVISAR'
      : 'VERIFICADO'

  const trustColor =
    trust?.riskLevel === 'high'
      ? '#ff6b6b'
      : trust?.riskLevel === 'medium'
      ? '#f5b942'
      : colors.primary

  const trustDesc =
    trust?.riskLevel === 'high'
      ? 'Algunas capacidades operativas fueron limitadas por integridad o seguridad.'
      : trust?.riskLevel ===
        'medium'
      ? 'Algunas capacidades fueron limitadas por integridad o seguridad.'
      : 'El entorno operativo cumple condiciones válidas para verificaciones seguras.'

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={
          colors.background
        }
      />

      <Text style={styles.eyebrow}>
        BY PINEAL SHIELD
      </Text>

      <Text style={styles.title}>
        Identidad operativa
      </Text>

      <Text style={styles.subtitle}>
        Entorno operativo para consulta segura de registros y evidencia certificada.
      </Text>

      <View style={styles.card}>
        <Text
          style={styles.sectionLabel}
        >
          Cliente verificado
        </Text>

        <Text style={styles.valueBig}>
          PinealID
        </Text>

        <Text style={styles.descSmall}>
          Cliente operativo conectado a la infraestructura Pineal Shield.
        </Text>
      </View>

      <View style={styles.card}>
        <Text
          style={styles.sectionLabel}
        >
          Estado operativo
        </Text>

        <Text
          style={[
            styles.status,
            {
              color: networkColor,
            },
          ]}
        >
          {networkLabel}
        </Text>

        <Text style={styles.desc}>
          {isOnline
            ? 'Acceso operativo disponible para consultas seguras de registros certificados.'
            : 'Modo local activo. Algunas consultas requieren conectividad segura.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text
          style={styles.sectionLabel}
        >
          Integridad del entorno
        </Text>

        <Text
          style={[
            styles.value,
            { color: trustColor },
          ]}
        >
          {trustLabel}
        </Text>

        <Text style={styles.desc}>
          {trustDesc}
        </Text>

        <Text style={styles.meta}>
          Entorno operativo · {shortId}
        </Text>

        <View style={styles.row}>
          <Pressable
            style={
              styles.secondaryButton
            }
            onPress={copyDeviceId}
          >
            <Text
              style={
                styles.secondaryText
              }
            >
              Copiar referencia
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.secondaryButton
            }
            onPress={boot}
          >
            <Text
              style={
                styles.secondaryText
              }
            >
              Actualizar estado
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text
          style={styles.sectionLabel}
        >
          Acceso institucional
        </Text>

        {identity.linked ? (
          <>
            <Text
              style={styles.value}
            >
              {identity.email?.toUpperCase()}
            </Text>

            <Text style={styles.desc}>
              Sesión activa en este
              dispositivo.
            </Text>

            {identity.expires_at ? (
              <Text
                style={styles.meta}
              >
                Vigencia ·{' '}
                {new Date(
                  identity.expires_at
                ).toLocaleDateString()}
              </Text>
            ) : null}

            <Pressable
              style={[
                styles.primaryButton,
                loading && {
                  opacity: 0.55,
                },
              ]}
              onPress={
                handleLogout
              }
              disabled={loading}
            >
              <Text
                style={
                  styles.primaryText
                }
              >
                {loading
                  ? 'Procesando...'
                  : 'Cerrar sesión'}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text
              style={styles.value}
            >
              NO INICIALIZADO
            </Text>

            <Text style={styles.desc}>
              Vincula tu correo para habilitar acceso institucional y continuidad operativa.
            </Text>

            <TextInput
              value={email}
              onChangeText={text =>
                setEmail(
                  text
                    .trim()
                    .toLowerCase()
                )
              }
              placeholder="correo@dominio.com"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            {!codeSent ? (
              <Pressable
                style={[
                  styles.primaryButton,
                  loading && {
                    opacity: 0.55,
                  },
                ]}
                onPress={
                  handleRequestAccess
                }
                disabled={loading}
              >
                <Text
                  style={
                    styles.primaryText
                  }
                >
                  {loading
                    ? 'Enviando...'
                    : 'Solicitar acceso'}
                </Text>
              </Pressable>
            ) : (
              <>
                <TextInput
                  value={code}
                  onChangeText={
                    setCode
                  }
                  placeholder="Código"
                  placeholderTextColor="#6b7280"
                  keyboardType="number-pad"
                  style={
                    styles.input
                  }
                />

                <Pressable
                  style={[
                    styles.primaryButton,
                    loading && {
                      opacity: 0.55,
                    },
                  ]}
                  onPress={
                    handleConfirm
                  }
                  disabled={loading}
                >
                  <Text
                    style={
                      styles.primaryText
                    }
                  >
                    {loading
                      ? 'Validando...'
                      : 'Confirmar acceso'}
                  </Text>
                </Pressable>

                <Pressable
                  style={
                    styles.linkButton
                  }
                  onPress={
                    handleRequestAccess
                  }
                  disabled={loading}
                >
                  <Text
                    style={
                      styles.linkText
                    }
                  >
                    Reenviar código
                  </Text>
                </Pressable>
              </>
            )}
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text
          style={styles.sectionLabel}
        >
          Registros vinculados
        </Text>

        <Text style={styles.value}>
          DISPONIBLE EN FASE POSTERIOR
        </Text>

        <Text style={styles.desc}>
          Este entorno permitirá gestionar registros certificados y evidencia digital asociada.
        </Text>
      </View>

      <Pressable
        style={({
          pressed,
        }) => [
          styles.button,
          pressed &&
            styles.pressed,
        ]}
        onPress={() =>
          navigation.navigate(
            'Legal'
          )
        }
      >
        <Text
          style={styles.buttonText}
        >
          Privacidad y cumplimiento
        </Text>
      </Pressable>

      <View style={styles.card}>
        <Text
          style={styles.sectionLabel}
        >
          Entorno
        </Text>

        <Text style={styles.meta}>
          Versión app · PinealID{' '}
          {ENV.APP_VERSION}
        </Text>

        <Text style={styles.meta}>
          Infraestructura ·{' '}
          {ENV.BUILD_VERSION}
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: 90,
  },

  eyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 2.4,
    marginTop: 34,
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
    backgroundColor:
      '#0b1018',
    borderRadius: 22,
    borderWidth: 1,
    borderColor:
      '#1a2230',
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
    fontWeight: '700',
    marginBottom: 10,
  },

  status: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },

  desc: {
    color:
      colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 14,
  },

  descSmall: {
    color:
      colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },

  input: {
    borderWidth: 1,
    borderColor:
      '#1a2230',
    backgroundColor:
      '#070b12',
    color: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },

  primaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor:
      '#070707',
    borderWidth: 1,
    borderColor:
      '#1a2230',
  },

  primaryText: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '700',
  },

  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },

  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      '#1a2230',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor:
      '#070b12',
  },

  secondaryText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  linkButton: {
    marginTop: 14,
    paddingVertical: 8,
  },

  linkText: {
    textAlign: 'center',
    color:
      colors.textSecondary,
    fontSize: 14,
  },

  button: {
    backgroundColor:
      '#080808',
    borderRadius: 20,
    borderWidth: 1,
    borderColor:
      '#1a2230',
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
    color:
      colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
})