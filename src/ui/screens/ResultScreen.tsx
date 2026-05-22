import React, { useEffect, useState } from 'react'
import { saveHistory } from '@/services/history'

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
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

        if (res.status !== 'unverified') {
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

  // =========================
  // INVALID
  // =========================

  if (status === 'invalid') {
    return (
      <StateScreen
        title="Identificador inválido"
        subtitle="Este identificador no corresponde a un registro verificable."
      />
    )
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <StateScreen
        loading
        title="Verificando"
        subtitle="Consultando evidencia asociada..."
      />
    )
  }

  // =========================
  // UNVERIFIED
  // =========================

  if (!result || result.status === 'unverified') {
    return (
      <StateScreen
        title="No verificado"
        subtitle="No existe un registro válido asociado a este identificador."
        button="Nueva verificación"
        onPress={() => navigation.replace('Scan')}
      />
    )
  }

  // 🔥 narrowing seguro
  const verifiedResult = result as Exclude<
    VerifyPublicResult,
    { status: 'unverified' }
  >

  const isVerified =
    verifiedResult.status === 'verified'

  const isRevoked =
    verifiedResult.status === 'revoked'

  const isReplaced =
    verifiedResult.status === 'replaced'

  const chainValid =
    verifiedResult.chain_valid ?? true

  const entityLabel =
    getEntityLabel(verifiedResult)

  const identifier = getIdentifier(
    verifiedResult,
    raw ?? ''
  )

  const mainStatus = (() => {
    if (isVerified && chainValid) {
      return 'REGISTRO VERIFICADO'
    }

    if (isVerified && !chainValid) {
      return 'REGISTRO CON OBSERVACIONES'
    }

    if (isRevoked) return 'REVOCADO'

    if (isReplaced) return 'REEMPLAZADO'

    return 'NO VERIFICADO'
  })()

  const mainText = (() => {
    if (isVerified && chainValid) {
      return 'La evidencia del registro coincide con la información emitida dentro de Pineal Shield.'
    }

    if (isVerified && !chainValid) {
      return 'El registro existe, pero requiere validación adicional.'
    }

    if (isRevoked) {
      return 'La certificación fue revocada por la entidad emisora.'
    }

    if (isReplaced) {
      return 'La certificación fue reemplazada por una nueva emisión.'
    }

    return 'No se encontró un registro válido.'
  })()

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>
        PINEAL SHIELD REGISTRY
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

          isVerified && chainValid
            ? styles.heroValid
            : isVerified && !chainValid
            ? styles.heroWarn
            : styles.heroDanger,
        ]}
      >
        <Text style={styles.heroLabel}>
          Estado del registro
        </Text>

        <Text style={styles.heroValue}>
          {mainStatus}
        </Text>

        <Text style={styles.heroText}>
          {mainText}
        </Text>
      </View>

      <Card>
        <Field
          label="Nombre"
          value={verifiedResult.nombre}
        />

        {verifiedResult.brand_name && (
          <Field
            label="Entidad emisora"
            value={verifiedResult.brand_name}
          />
        )}

        {verifiedResult.source_entity &&
          !verifiedResult.brand_name && (
            <Field
              label="Entidad emisora"
              value={verifiedResult.source_entity}
            />
          )}

        <Field
          label="Tipo"
          value={entityLabel}
        />

        <Field
          label="Emitido"
          value={date(
            verifiedResult.issued_at
          )}
        />

        <Field
          label="Validado por"
          value="Pineal Shield"
        />
      </Card>

      {verifiedResult.image_url && (
        <View style={styles.mediaCard}>
          <Image
            source={{
              uri: verifiedResult.image_url,
            }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      )}

      <Card>
        <Field
          label="Identificador"
          value={mask(identifier)}
        />

        {verifiedResult.hash && (
          <Field
            label="Referencia"
            value={mask(
              verifiedResult.hash
            )}
          />
        )}

        {verifiedResult.verification_origin && (
          <Field
            label="Origen de verificación"
            value={
              verifiedResult.verification_origin
            }
          />
        )}
      </Card>

      {verifiedResult.entity ===
        'document' && (
        <Card>
          <Text style={styles.sectionTitle}>
            Documento asociado
          </Text>

          {verifiedResult.holder_name && (
            <Field
              label="Titular"
              value={
                verifiedResult.holder_name
              }
            />
          )}

          {verifiedResult.holder_identifier && (
            <Field
              label="Identificador del titular"
              value={
                verifiedResult.holder_identifier
              }
            />
          )}

          {verifiedResult.file_url && (
            <Field
              label="Estado"
              value="Archivo vinculado al registro verificado"
            />
          )}
        </Card>
      )}

      <Card>
        <Text style={styles.sectionTitle}>
          Integridad
        </Text>

        <Text style={styles.sectionText}>
          {chainValid
            ? 'La integridad digital del registro es válida.'
            : 'La integridad del registro requiere revisión manual.'}
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>
          Verificación
        </Text>

        <Text style={styles.sectionText}>
          Consulta ejecutada desde entorno operativo PinealID.
        </Text>
      </Card>

      <Pressable
        style={styles.button}
        onPress={() =>
          navigation.replace('Scan')
        }
      >
        <Text style={styles.buttonText}>
          Nueva verificación
        </Text>
      </Pressable>

      <Text style={styles.footerBrand}>
        Verification Layer · 2026.03
      </Text>
    </ScrollView>
  )
}

// =========================
// COMPONENTS
// =========================

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
          style={styles.iconSpacing}
        />
      ) : (
        <View style={styles.stateBadge}>
          <Text style={styles.stateBadgeText}>
            PINEALID
          </Text>
        </View>
      )}

      <Text style={styles.stateTitle}>
        {title}
      </Text>

      <Text style={styles.stateSub}>
        {subtitle}
      </Text>

      {button && onPress && (
        <Pressable
          style={styles.button}
          onPress={onPress}
        >
          <Text style={styles.buttonText}>
            {button}
          </Text>
        </Pressable>
      )}
    </View>
  )
}

function Card({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <View style={styles.card}>
      {children}
    </View>
  )
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
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <Text style={styles.fieldValue}>
        {value}
      </Text>
    </View>
  )
}

// =========================
// HELPERS
// =========================

function getEntityLabel(
  result: Exclude<
    VerifyPublicResult,
    { status: 'unverified' }
  >
) {
  switch (result.entity) {
    case 'artifact':
      return 'Registro verificado'

    case 'artifact_piece':
      return 'Pieza verificada'

    case 'document':
      return 'Documento'

    default:
      return 'Registro'
  }
}

function getIdentifier(
  result: Exclude<
    VerifyPublicResult,
    { status: 'unverified' }
  >,
  fallback: string
) {
  if (
    result.entity === 'artifact_piece'
  ) {
    return result.artifact_piece_id
  }

  if (result.entity === 'artifact') {
    return result.artifact_id
  }

  if (result.entity === 'document') {
    return result.document_id
  }

  return fallback
}

function mask(v: string) {
  if (!v) return ''

  if (v.length <= 12) return v

  return `${v.slice(0, 6)}…${v.slice(-6)}`
}

function date(v: string) {
  try {
    return new Date(v).toLocaleString()
  } catch {
    return v
  }
}

// =========================
// STYLES
// =========================

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
    fontSize: 32,
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

  heroDanger: {
    backgroundColor: '#2a0d0d',
    borderColor: '#7f1d1d',
  },

  heroLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 6,
  },

  heroValue: {
    color: colors.textPrimary,
    fontSize: 18,
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
    backgroundColor:
      'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.06)',
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
    borderColor:
      'rgba(0,255,200,0.25)',
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

  image: {
    width: '100%',
    height: 280,
    borderRadius: 12,
  },

  mediaCard: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 14,
  },

  iconSpacing: {
    marginBottom: 18,
  },
})