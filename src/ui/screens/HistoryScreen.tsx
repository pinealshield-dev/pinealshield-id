import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native'

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'

import { colors, spacing } from '@/theme'
import {
  getDeviceHistory,
  type DeviceHistoryItem,
  type HistoryStatus,
} from '@/services/historyClient'

export function HistoryScreen() {
  const navigation = useNavigation<any>()

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<DeviceHistoryItem[]>([])
  const [error, setError] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let active = true

      async function load() {
        try {
          setLoading(true)
          setError(false)

          const history = await getDeviceHistory(20)

          if (active) {
            setItems(history)
          }
        } catch {
          if (active) {
            setError(true)
            setItems([])
          }
        } finally {
          if (active) {
            setLoading(false)
          }
        }
      }

      load()

      return () => {
        active = false
      }
    }, [])
  )

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
        Historial
      </Text>

      <Text style={styles.subtitle}>
        Actividad reciente registrada por PinealID
        contra la infraestructura Pineal Shield.
      </Text>

      {loading ? (
        <View style={styles.card}>
          <ActivityIndicator
            color={colors.primary}
            size="large"
          />

          <Text style={styles.loadingText}>
            Consultando actividad segura...
          </Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            Estado
          </Text>

          <Text style={styles.emptyTitle}>
            HISTORIAL NO DISPONIBLE
          </Text>

          <Text style={styles.cardBody}>
            No fue posible consultar la actividad del
            dispositivo en este momento.
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate('Verificar')}
          >
            <Text style={styles.buttonText}>
              Nueva verificación
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            Estado
          </Text>

          <Text style={styles.emptyTitle}>
            SIN ACTIVIDAD REGISTRADA
          </Text>

          <Text style={styles.cardBody}>
            Aún no existen verificaciones asociadas a
            este dispositivo.
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate('Verificar')}
          >
            <Text style={styles.buttonText}>
              Nueva verificación
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <>
          {items.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
            />
          ))}
        </>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          Trazabilidad
        </Text>

        <Text style={styles.infoText}>
          Esta vista muestra actividad consultada desde
          este dispositivo. La evidencia institucional
          vive en la infraestructura Pineal Shield.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          Metadata técnica
        </Text>

        <Text style={styles.meta}>
          Fuente · Pineal Shield Registry
        </Text>

        <Text style={styles.meta}>
          Sync Layer · Device Activity
        </Text>
      </View>
    </ScrollView>
  )
}

function HistoryCard({
  item,
}: {
  item: DeviceHistoryItem
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>
        {formatDate(item.created_at)}
      </Text>

      <Text
        style={[
          styles.status,
          { color: statusColor(item.status) },
        ]}
      >
        {statusLabel(item.status)}
      </Text>

      <Text style={styles.identifier}>
        {item.identifier ?? 'Registro consultado'}
      </Text>

      <Text style={styles.cardBody}>
        Consulta registrada desde PinealID.
      </Text>

      {item.app_version ? (
        <Text style={styles.meta}>
          App · {item.app_version}
        </Text>
      ) : null}
    </View>
  )
}

function statusLabel(status: HistoryStatus) {
  switch (status) {
    case 'verified':
      return 'VERIFICADO'
    case 'unverified':
      return 'NO VERIFICADO'
    case 'revoked':
      return 'REVOCADO'
    case 'replaced':
      return 'REEMPLAZADO'
    default:
      return 'DESCONOCIDO'
  }
}

function statusColor(status: HistoryStatus) {
  switch (status) {
    case 'verified':
      return colors.primary
    case 'revoked':
      return '#ff8a65'
    case 'replaced':
      return '#ffd166'
    case 'unverified':
      return colors.textMuted
    default:
      return colors.textMuted
  }
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
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
    marginBottom: 22,
  },

  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1a2230',
    backgroundColor: '#0b1018',
    padding: 22,
    marginBottom: 18,
  },

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 10,
  },

  emptyTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },

  status: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },

  identifier: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 10,
  },

  cardBody: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },

  infoText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },

  button: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 20,
  },

  buttonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },

  meta: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
})