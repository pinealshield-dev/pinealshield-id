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
  const [isOnline, setIsOnline] = useState<boolean | null>(null)

  const [identity, setIdentity] =
    useState<IdentityState>({
      linked: false,
      email: null,
      expires_at: null,
    })

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)

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
      const data = await getMobileIdentity()

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
      if (!email.trim()) {
        Alert.alert(
          'Correo requerido',
          'Ingresa un correo válido.'
        )
        return
      }

      setLoading(true)

      const res = await requestAccess(email)

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
          'Demasiados intentos. Espera unos minutos.'
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
          'No fue posible generar acceso.'
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
        'Dispositivo vinculado correctamente.'
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
        'El dispositivo quedó en modo local.'
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
      'Identificador copiado.'
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
        Cuenta
      </Text>

      <Text style={styles.subtitle}>
        Identidad local,
        dispositivo confiable y
        acceso progresivo al
        ecosistema Pineal Shield.
      </Text>

      {/* IDENTIDAD */}
      <View style={styles.card}>
        <Text
          style={styles.sectionLabel}
        >
          Identidad
        </Text>

        <Text style={styles.valueBig}>
          PinealID
        </Text>

        <Text style={styles.descSmall}>
          Cliente móvil
          institucional para
          verificación y futura
          gestión de activos
          autenticados.
        </Text>
      </View>

      {/* RED */}
      <View style={styles.card}>
        <Text
          style={styles.sectionLabel}
        >
          Estado del ecosistema
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
            ? 'Conectividad disponible con servicios Pineal Shield.'
            : 'Sin conexión para verificaciones remotas.'}
        </Text>
      </View>

      {/* DEVICE */}
      <View style={styles.card}>
        <Text
          style={styles.sectionLabel}
        >
          Estado del dispositivo
        </Text>

        <Text style={styles.value}>
          CONFIABLE
        </Text>

        <Text style={styles.desc}>
          Dispositivo registrado
          con identidad técnica
          persistente.
        </Text>

        <Text style={styles.meta}>
          Ref · {shortId}
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
              Copiar ref
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
              Refresh
            </Text>
          </Pressable>
        </View>
      </View>

      {/* CUENTA */}
      <View style={styles.card}>
        <Text
          style={styles.sectionLabel}
        >
          Cuenta PinealID
        </Text>

        {identity.linked ? (
          <>
            <Text
              style={styles.value}
            >
              {identity.email?.toUpperCase()}
            </Text>

            <Text style={styles.desc}>
              Sesión activa en
              este dispositivo.
            </Text>

            {identity.expires_at ? (
              <Text
                style={styles.meta}
              >
                Expira ·{' '}
                {new Date(
                  identity.expires_at
                ).toLocaleDateString()}
              </Text>
            ) : null}

            <Pressable
              style={
                styles.primaryButton
              }
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
              NO VINCULADA
            </Text>

            <Text style={styles.desc}>
              Opera en modo local
              seguro.
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
                style={
                  styles.primaryButton
                }
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
                    ? 'Procesando...'
                    : 'Enviar código'}
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
                  style={
                    styles.primaryButton
                  }
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

      {/* ACTIVOS */}
      <View style={styles.card}>
        <Text
          style={styles.sectionLabel}
        >
          Mis activos
        </Text>

        <Text style={styles.value}>
          CAPA PREPARADA
        </Text>

        <Text style={styles.desc}>
          Aquí vivirán productos
          vinculados,
          certificados,
          propiedad digital y
          transferencias
          verificables.
        </Text>
      </View>

      {/* LEGAL */}
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
          Privacidad y Legal
        </Text>
      </Pressable>

      {/* METADATA */}
      <View style={styles.card}>
        <Text
          style={styles.sectionLabel}
        >
          Metadata técnica
        </Text>

        <Text style={styles.meta}>
          App · PinealID{' '}
          {ENV.APP_VERSION}
        </Text>

        <Text style={styles.meta}>
          Verification Layer ·{' '}
          {ENV.BUILD_VERSION}
        </Text>

        <Text style={styles.meta}>
          Host ·
          verify.pinealshield.com
        </Text>

        <Text style={styles.meta}>
          Mode · Identity Edge
          Client
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