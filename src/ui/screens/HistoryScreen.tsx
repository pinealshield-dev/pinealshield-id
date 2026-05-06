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
        Registro de actividad
      </Text>

      <Text style={styles.subtitle}>
        Actividad reciente asociada a consultas realizadas dentro del entorno PinealID.
      </Text>

      {loading && (
        <View style={styles.card}>
          <ActivityIndicator
            color={colors.primary}
            size="large"
          />

          <Text style={styles.loadingText}>
            Consultando registros recientes...
          </Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.card}>
          <Text style={styles.emptyTitle}>
            No disponible
          </Text>

          <Text style={styles.cardBody}>
            No fue posible cargar tu historial en este momento.
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate('Scan')}
          >
            <Text style={styles.buttonText}>
              Nueva verificación
            </Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && items.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.emptyTitle}>
            Sin verificaciones
          </Text>

          <Text style={styles.cardBody}>
            Aún no existen registros consultados desde este dispositivo.
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate('Scan')}
          >
            <Text style={styles.buttonText}>
              Consultar registro
            </Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          {items.map((item) => (
            <HistoryCard key={item.id} item={item} />
          ))}
        </>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Integridad del historial
        </Text>

        <Text style={styles.infoText}>
          Cada entrada refleja el estado registrado al momento de la consulta.
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
      <Text style={styles.date}>
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
        Resultado registrado en el historial seguro del dispositivo.
      </Text>
    </View>
  )
}

function statusLabel(status: HistoryStatus) {
  switch (status) {
    case 'verified':
      return 'REGISTRO VÁLIDO'
    case 'unverified':
      return 'SIN REGISTRO'
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
      return '#f87171'
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

  date: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },

  status: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },

  identifier: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },

  cardBody: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },

  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },

  button: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },

  buttonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  emptyTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
                    
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
})