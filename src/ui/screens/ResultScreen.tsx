import React, { useEffect, useState } from 'react';
import { saveHistory } from '@/services/history';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import {
  useRoute,
  useNavigation,
} from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/navigation/RootNavigator';
import { verifyByHashPublic } from '@/services/verifyClient';
import type { VerifyPublicResult } from '@/domain/verification';
import { colors, spacing } from '@/theme';

type Route = RouteProp<RootStackParamList, 'Result'>;
type Navigation = NativeStackNavigationProp<
  RootStackParamList,
  'Result'
>;

export function ResultScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Navigation>();

  const { status, raw } = route.params ?? {};

  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<VerifyPublicResult | null>(null);

  useEffect(() => {
    if (status !== 'scanned' || !raw) return;

    let isMounted = true;
    const controller = new AbortController();

    setLoading(true);

    verifyByHashPublic(raw, controller.signal)
      .then((res) => {
        if (!isMounted) return;

        setResult(res);

        if (res.status === 'verified') {
          saveHistory({
            hash: raw,
            nombre: res.nombre,
            fecha: new Date().toISOString(),
            status: res.status,
          });
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setResult({ status: 'unverified' });
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [status, raw]);

  /* =========================== */

  if (status === 'invalid') {
    return (
      <Centered>
        <Text style={[styles.title, styles.error]}>
          Identificador inválido
        </Text>
        <Text style={styles.subtitle}>
          El código no corresponde a un registro Pineal Shield.
        </Text>
      </Centered>
    );
  }

  if (loading) {
    return (
      <Centered>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.subtitle}>
          Verificando registro…
        </Text>
      </Centered>
    );
  }

  if (!result || result.status === 'unverified') {
    return (
      <Centered>
        <Text style={[styles.title, styles.error]}>
          Registro no encontrado
        </Text>
        <Text style={styles.subtitle}>
          No existe un registro verificable en este momento.
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => navigation.replace('Scan')}
        >
          <Text style={styles.retryText}>
            Intentar nuevamente
          </Text>
        </Pressable>
      </Centered>
    );
  }

  const isVerified = result.status === 'verified';
  const chainValid = isVerified ? result.chain_valid ?? true : true;

  const isDegraded = isVerified && !chainValid;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      {/* HEADER */}
      <Text style={styles.headerBrand}>
        PINEAL SHIELD REGISTRY
      </Text>

      <Text style={[styles.title, styles.success]}>
        {chainValid ? 'REGISTRO VERIFICADO' : 'REGISTRO DETECTADO'}
      </Text>

      {/* EXISTENCIA */}
      <View
      style={[
        styles.statusBox,
        isDegraded && styles.statusDegraded,
      ]}
>
        <Text style={styles.statusTitle}>
          {chainValid
            ? 'Estado del registro: ACTIVO'
            : 'Estado del registro: ACTIVO (integridad no verificada)'}
        </Text>

        <Text style={styles.statusText}>
          {chainValid
            ? 'Este registro existe dentro de la infraestructura Pineal Shield.'
            : 'El registro existe, pero su consistencia técnica no puede confirmarse completamente.'}
        </Text>
      </View>

      {/* 🔴 INTEGRIDAD (NÚCLEO DIFERENCIADOR) */}
      <View
        style={[
          styles.integrityBox,
          chainValid ? styles.valid : styles.warning,
        ]}
      >
        <Text style={styles.integrityLabel}>
          INTEGRIDAD CRIPTOGRÁFICA
        </Text>

        <Text style={styles.integrityValue}>
          {chainValid
            ? 'CADENA CONSISTENTE'
            : 'CONSISTENCIA NO VERIFICABLE'}
        </Text>

        <Text style={styles.integrityText}>
          {chainValid
            ? 'El registro forma parte de una secuencia de eventos consistente dentro del sistema.'
            : 'Se detectaron inconsistencias en la secuencia de eventos o no es posible validar su continuidad completa.'}
        </Text>
      </View>

      {/* ARTIFACT */}
      <View style={styles.cardPrimary}>
        <Field label="Tipo" value={capitalize(result.kind)} />
        <Field label="Nombre" value={result.nombre} />
        <Field
          label="Emitido"
          value={formatDate(result.issued_at)}
        />
        <Field label="Firma" value={result.signature} />
        <Field label="Verificación" value="Pineal Shield Registry" />
        {result.brand_name && (
          <Field label="Marca" value={result.brand_name} />
        )}
      </View>

      {/* IDENTIDAD CRIPTOGRÁFICA */}
      <View style={styles.cardSecondary}>
        <Text style={styles.hashLabel}>
          Identificador criptográfico
        </Text>
        <Text style={styles.hashValue}>
          {obfuscate(raw!)}
        </Text>
      </View>

      {/* HISTORIAL (ABSTRACCIÓN CONTROLADA) */}
      <View style={styles.historyBox}>
        <Text style={styles.historyTitle}>
          Actividad de verificación
        </Text>

        <Text style={styles.historyText}>
          Este registro ha sido consultado dentro de la infraestructura Pineal Shield.
        </Text>

        <Text style={styles.historySub}>
          La visibilidad detallada puede estar restringida por razones de seguridad.
        </Text>
      </View>

      <Pressable
        style={styles.retryButton}
        onPress={() => navigation.replace('Scan')}
      >
        <Text style={styles.retryText}>
          Verificar otro código
        </Text>
      </Pressable>
    </ScrollView>
  );
}

/* =========================== */

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

/* =========================== */

function obfuscate(hash: string): string {
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-6)}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* =========================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },

  headerBrand: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 6,
    textAlign: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  success: {
    color: colors.primary,
  },

  error: {
    color: '#E5533D',
  },

  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  statusBox: {
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: '#0f2a1f',
    borderWidth: 1,
    borderColor: '#1f5c45',
    marginBottom: spacing.md,
  },

  statusTitle: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },

  statusText: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  statusDegraded: {
    backgroundColor: '#2a210c',
    borderColor: '#8a6d1a',
  },

  integrityBox: {
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },

  valid: {
    borderColor: '#1f5c45',
    backgroundColor: '#0b1f18',
  },

  warning: {
    borderColor: '#8a6d1a',
    backgroundColor: '#2a210c',
  },

  integrityLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },

  integrityValue: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.textPrimary,
  },

  integrityText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  cardPrimary: {
    borderRadius: 16,
    padding: spacing.lg,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1c1c1c',
    marginBottom: spacing.lg,
  },

  cardSecondary: {
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#1c1c1c',
    marginBottom: spacing.xl,
  },

  fieldLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },

  fieldValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },

  hashLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 4,
  },

  hashValue: {
    color: colors.textPrimary,
    fontFamily: 'monospace',
  },

  retryButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  retryText: {
    color: colors.primary,
    fontWeight: '600',
  },

  historyBox: {
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#1c1c1c',
    marginBottom: spacing.xl,
  },

  historyTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },

  historyText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  historySub: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 11,
  },
});