import React, { useEffect, useState } from 'react';
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

/* ===========================
   TYPES
=========================== */

type Route = RouteProp<RootStackParamList, 'Result'>;
type Navigation = NativeStackNavigationProp<
  RootStackParamList,
  'Result'
>;

/* ===========================
   SCREEN
=========================== */

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

  /* ===========================
     INVALID
  =========================== */

  if (status === 'invalid') {
    return (
      <Centered>
        <Text style={[styles.title, styles.error]}>
          Código no válido
        </Text>
        <Text style={styles.subtitle}>
          El identificador no pertenece a la infraestructura Pineal Shield.
        </Text>
      </Centered>
    );
  }

  /* ===========================
     LOADING
  =========================== */

  if (loading) {
    return (
      <Centered>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
        <Text style={styles.subtitle}>
          Verificando autenticidad…
        </Text>
      </Centered>
    );
  }

  /* ===========================
     UNVERIFIED
  =========================== */

  if (!result || result.status === 'unverified') {
    return (
      <Centered>
        <Text style={[styles.title, styles.error]}>
          Certificación no verificada
        </Text>
        <Text style={styles.subtitle}>
          No existe un registro válido asociado a este identificador.
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => navigation.navigate('Scan')}
        >
          <Text style={styles.retryText}>
            Intentar nuevamente
          </Text>
        </Pressable>
      </Centered>
    );
  }

  /* ===========================
     VERIFIED
  =========================== */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <Text style={[styles.title, styles.success]}>
        Certificación válida
      </Text>

      <Text style={styles.brand}>
        Pineal Shield® Infrastructure
      </Text>

      <View style={styles.cardPrimary}>
        <Field label="Tipo" value={capitalize(result.kind)} />
        <Field label="Nombre" value={result.nombre} />
        <Field
          label="Registrado"
          value={formatDate(result.issued_at)}
        />
        {result.brand_name && (
          <Field label="Marca" value={result.brand_name} />
        )}
      </View>

      <View style={styles.cardSecondary}>
        <Text style={styles.hashLabel}>
          Hash verificado
        </Text>
        <Text style={styles.hashValue}>
          {obfuscate(raw!)}
        </Text>
      </View>

      <Pressable
        style={styles.retryButton}
        onPress={() => navigation.navigate('Scan')}
      >
        <Text style={styles.retryText}>
          Verificar otro código
        </Text>
      </Pressable>
    </ScrollView>
  );
}

/* ===========================
   COMPONENTS
=========================== */

function Centered({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View style={styles.centered}>{children}</View>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

/* ===========================
   UTILS
=========================== */

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

/* ===========================
   STYLES
=========================== */

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

  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  brand: {
    color: colors.textMuted,
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: spacing.xl,
    textAlign: 'center',
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
    marginBottom: 2,
  },

  fieldValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },

  hashLabel: {
    color: colors.textMuted,
    fontSize: 12,
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
    letterSpacing: 0.5,
  },
});
