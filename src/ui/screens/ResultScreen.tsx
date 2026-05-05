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

  // --- INVALID ---
  if (status === 'invalid') {
    return (
      <StateScreen
        title="Código no válido"
        subtitle="Este código no corresponde a un registro verificable."
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
        subtitle="No se encontró un registro válido dentro de Pineal Shield."
        button="Intentar nuevamente"
        onPress={() => navigation.replace('Scan')}
      />
    )
  }

  // --- RESULTADO RESUELTO ---
  const isVerified = result.status === 'verified'
  const isRevoked = result.status === 'revoked'
  const isReplaced = result.status === 'replaced'

  const chainValid = result.chain_valid ?? true
  const entityLabel = getEntityLabel(result.kind)
  const identifier = getIdentifier(result, raw ?? '')

  const mainStatus = (() => {
    if (isVerified && chainValid) return 'AUTÉNTICO'
    if (isVerified && !chainValid) return 'VERIFICADO CON OBSERVACIONES'
    if (isRevoked) return 'REVOCADO'
    if (isReplaced) return 'REEMPLAZADO'
    return 'NO VERIFICADO'
  })()

  const mainText = (() => {
    if (isVerified && chainValid) {
      return `${entityLabel} verificado contra el registro oficial.`
    }

    if (isVerified && !chainValid) {
      return `${entityLabel} existe, pero requiere validación adicional.`
    }

    if (isRevoked) {
      return `${entityLabel} invalidado por la entidad emisora.`
    }

    if (isReplaced) {
      return `${entityLabel} reemplazado por una versión más reciente.`
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
        <Field label="Nombre" value={result.nombre} />

        {result.brand_name && (
          <Field label="Marca" value={result.brand_name} />
        )}

        {result.source_entity && !result.brand_name && (
          <Field label="Entidad emisora" value={result.source_entity} />
        )}

        <Field label="Tipo" value={entityLabel} />

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
          label={`Identificador del ${entityLabel.toLowerCase()}`}
          value={mask(identifier)}
        />

        {result.hash && (
          <Field
            label="Hash"
            value={mask(result.hash)}
          />
        )}

        {result.verification_origin && (
          <Field
            label="Origen de verificación"
            value={result.verification_origin}
          />
        )}
      </Card>

      {result.entity === 'document' && (
        <Card>
          <Text style={styles.sectionTitle}>
            Documento
          </Text>

          {'holder_name' in result && result.holder_name && (
            <Field
              label="Titular"
              value={result.holder_name}
            />
          )}

          {'holder_identifier' in result &&
            result.holder_identifier && (
              <Field
                label="Identificador del titular"
                value={result.holder_identifier}
              />
            )}

          {'file_url' in result && result.file_url && (
            <Field
              label="Archivo"
              value="Documento asociado al registro"
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
            ? 'La cadena de certificación es válida.'
            : 'La cadena de certificación requiere revisión adicional.'}
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>
          Actividad
        </Text>

        <Text style={styles.sectionText}>
          {`${entityLabel} verificado desde PinealID.`}
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

function getEntityLabel(kind: string) {
  switch (kind) {
    case 'producto':
      return 'Producto'
    case 'pieza':
      return 'Pieza'
    case 'document':
      return 'Documento'
    default:
      return 'Registro'
  }
}

function getIdentifier(result: VerifyPublicResult, fallback: string) {
  if (result.status === 'unverified') return fallback

  if ('artifact_piece_id' in result && result.artifact_piece_id) {
    return result.artifact_piece_id
  }

  if ('artifact_id' in result && result.artifact_id) {
    return result.artifact_id
  }

  if ('document_id' in result && result.document_id) {
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