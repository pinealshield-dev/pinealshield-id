import React, { useEffect, useState } from 'react'
import { saveHistory } from '@/services/history'
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native'

import {
  useRoute,
  useNavigation,
} from '@react-navigation/native'

import type { RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import type { RootStackParamList } from '@/navigation/RootNavigator'
import {
  verifyByHashPublic,
  VerifyOfflineError,
} from '@/services/verifyClient'
import type { VerifyPublicResult } from '@/domain/verification'
import { colors, spacing } from '@/theme'

type Route = RouteProp<RootStackParamList, 'Result'>
type Nav = NativeStackNavigationProp<
  RootStackParamList,
  'Result'
>

export function ResultScreen() {
  const route = useRoute<Route>()
  const navigation = useNavigation<Nav>()

  const { status, raw } = route.params ?? {}

  const [loading, setLoading] = useState(false)
  const [result, setResult] =
    useState<VerifyPublicResult | null>(null)

  useEffect(() => {
    if (status !== 'scanned' || !raw) return

    let mounted = true
    const controller = new AbortController()

    setLoading(true)
    setResult(null)

    verifyByHashPublic(raw, controller.signal)
      .then((res) => {
        if (!mounted) return

        setResult(res)

        if (res.status === 'verified') {
          saveHistory({
            hash: raw,
            nombre: res.nombre,
            fecha: new Date().toISOString(),
            status: res.status,
          })
        }
      })
      .catch((err) => {
        if (!mounted) return

        if (err instanceof VerifyOfflineError) {
          navigation.replace('Offline')
          return
        }

        setResult({ status: 'unverified' })
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
      controller.abort()
    }
  }, [status, raw, navigation])

  // --- INVALID ---
  if (status === 'invalid') {
    return (
      <StateScreen
        title="Código no válido"
        subtitle="Este código no corresponde a un producto verificable."
      />
    )
  }

  // --- LOADING ---
  if (loading) {
    return (
      <StateScreen
        loading
        title="Verificando"
        subtitle="Consultando información segura..."
      />
    )
  }

  // --- NO VERIFICADO ---
  if (!result || result.status === 'unverified') {
    return (
      <StateScreen
        title="No verificado"
        subtitle="No se encontró un registro válido para este producto."
        button="Intentar nuevamente"
        onPress={() => navigation.replace('Scan')}
      />
    )
  }

  // --- VALIDADO ---
  const isVerified = result.status === 'verified'
  const chainValid = isVerified
    ? result.chain_valid ?? true
    : true

  const mainStatus = chainValid
    ? 'AUTÉNTICO'
    : 'VERIFICADO CON OBSERVACIONES'

  const mainText = chainValid
    ? 'Este producto es auténtico.'
    : 'El producto existe, pero no se validó completamente.'

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>
        BY PINEAL SHIELD
      </Text>

      <Text style={styles.titleCentered}>
        {mainStatus}
      </Text>

      <Text style={styles.subtitleCentered}>
        {mainText}
      </Text>

      <View
        style={[
          styles.hero,
          chainValid
            ? styles.heroValid
            : styles.heroWarn,
        ]}
      >
        <Text style={styles.heroLabel}>
          Estado del producto
        </Text>

        <Text style={styles.heroValue}>
          {chainValid ? 'VERIFICADO' : 'PARCIAL'}
        </Text>

        <Text style={styles.heroText}>
          {chainValid
            ? 'La información coincide con el registro oficial.'
            : 'Se recomienda validar el origen del producto.'}
        </Text>
      </View>

      <Card>
        <Field label="Nombre" value={result.nombre} />

        {result.brand_name && (
          <Field label="Marca" value={result.brand_name} />
        )}

        <Field label="Tipo" value={cap(result.kind)} />

        <Field
          label="Emitido"
          value={date(result.issued_at)}
        />

        <Field
          label="Verificado por"
          value="Pineal Shield"
        />
      </Card>

      <Card>
        <Field
          label="Identificador del producto"
          value={mask(raw!)}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>
          Actividad
        </Text>

        <Text style={styles.sectionText}>
          Este producto fue verificado desde PinealID.
        </Text>
      </Card>

      <Pressable
        style={styles.button}
        onPress={() => navigation.replace('Scan')}
      >
        <Text style={styles.buttonText}>
          Nueva verificación
        </Text>
      </Pressable>

      <Text style={styles.footerBrand}>
        Verification Layer · 2026.02
      </Text>
    </ScrollView>
  )
}

// --- COMPONENTES ---

function StateScreen({
  title,
  subtitle,
  loading = false,
  button,
  onPress,
}: {
  title: string
  subtitle: string
  loading?: boolean
  button?: string
  onPress?: () => void
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.stateEyebrow}>
        BY PINEAL SHIELD
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginBottom: 18 }}
        />
      ) : (
        <View style={styles.stateBadge}>
          <Text style={styles.stateBadgeText}>
            PINEALID
          </Text>
        </View>
      )}

      <Text style={styles.stateTitle}>{title}</Text>

      <Text style={styles.stateSub}>
        {subtitle}
      </Text>

      {button && onPress && (
        <Pressable style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>{button}</Text>
        </Pressable>
      )}
    </View>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>
}

function Field({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  )
}

// --- HELPERS ---

function mask(v: string) {
  if (v.length <= 12) return v
  return `${v.slice(0, 6)}…${v.slice(-6)}`
}

function cap(v: string) {
  if (!v) return ''
  return v.charAt(0).toUpperCase() + v.slice(1)
}

function date(v: string) {
  try {
    return new Date(v).toLocaleString()
  } catch {
    return v
  }
}

// --- STYLES ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 2.4,
    marginBottom: 10,
    textAlign: 'center',
  },
  titleCentered: {
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleCentered: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 18,
  },
  hero: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  heroValid: {
    backgroundColor: '#0b2219',
    borderColor: '#114c38',
  },
  heroWarn: {
    backgroundColor: '#2b210c',
    borderColor: '#7a6419',
  },
  heroLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 6,
  },
  heroValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 14,
  },
  fieldWrap: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  fieldValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
  },
  button: {
    marginTop: 24,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  footerBrand: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
  stateEyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    marginBottom: 14,
  },
  stateBadge: {
    borderWidth: 1,
    borderColor: 'rgba(0,255,200,0.25)',
    borderRadius: 999,
    padding: 8,
    marginBottom: 16,
  },
  stateBadgeText: {
    color: colors.primary,
    fontWeight: '700',
  },
  stateTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  stateSub: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
})