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

/* =========================== */

type Route = RouteProp<RootStackParamList, 'Result'>;
type Navigation = NativeStackNavigationProp<
  RootStackParamList,
  'Result'
>;

/* =========================== */

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
          Invalid Code
        </Text>
        <Text style={styles.subtitle}>
          This identifier does not belong to Pineal Shield infrastructure.
        </Text>
      </Centered>
    );
  }

  if (loading) {
    return (
      <Centered>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.subtitle}>
          Verifying authenticity…
        </Text>
      </Centered>
    );
  }

  if (!result || result.status === 'unverified') {
    return (
      <Centered>
        <Text style={[styles.title, styles.error]}>
          Not Verified
        </Text>
        <Text style={styles.subtitle}>
          No valid record found for this identifier.
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => navigation.navigate('Scan')}
        >
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </Pressable>
      </Centered>
    );
  }

  /* =========================== */

  const chainValid = (result as any).chain_valid ?? true;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      {/* HEADER */}
      <Text style={styles.headerBrand}>
        PINEAL SHIELD
      </Text>

      <Text style={[styles.title, styles.success]}>
        Verification Result
      </Text>

      <Text style={styles.subtitleCenter}>
        Verified Artifact
      </Text>

      {/* STATUS */}
      <View style={styles.statusBox}>
        <Text style={styles.statusText}>
          This record exists and is active within Pineal Shield infrastructure.
        </Text>
      </View>

      {/* 🔴 INTEGRITY */}
      <View
        style={[
          styles.integrityBox,
          chainValid ? styles.valid : styles.warning,
        ]}
      >
        <Text style={styles.integrityLabel}>
          REGISTRY INTEGRITY
        </Text>

        <Text style={styles.integrityValue}>
          {chainValid ? 'VALID' : 'INCONSISTENT'}
        </Text>

        <Text style={styles.integrityText}>
          {chainValid
            ? 'This record is part of a consistent verification chain.'
            : 'Integrity of the verification chain cannot be guaranteed.'}
        </Text>
      </View>

      {/* DETAILS */}
      <View style={styles.cardPrimary}>
        <Field label="Type" value={capitalize(result.kind)} />
        <Field label="Name" value={result.nombre} />
        <Field label="Issued" value={formatDate(result.issued_at)} />
        <Field label="Signature" value={result.signature} />
        <Field label="Verification Origin" value="Pineal Shield Registry" />

        {result.brand_name && (
          <Field label="Brand" value={result.brand_name} />
        )}
      </View>

      {/* HASH */}
      <View style={styles.cardSecondary}>
        <Text style={styles.hashLabel}>
          Cryptographic Record
        </Text>
        <Text style={styles.hashValue}>
          {obfuscate(raw!)}
        </Text>
      </View>

      {/* CTA */}
      <Pressable
        style={styles.retryButton}
        onPress={() => navigation.navigate('Scan')}
      >
        <Text style={styles.retryText}>
          Verify Another Code
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
    textAlign: 'center',
    color: colors.textMuted,
    letterSpacing: 2,
    fontSize: 11,
    marginBottom: spacing.sm,
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },

  subtitleCenter: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.lg,
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
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: '#0f2a1d',
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.lg,
  },

  statusText: {
    color: colors.textPrimary,
    textAlign: 'center',
  },

  integrityBox: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  valid: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#0a1f17',
  },

  warning: {
    borderWidth: 1,
    borderColor: '#FFC857',
    backgroundColor: '#2a1f0f',
  },

  integrityLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },

  integrityValue: {
    fontSize: 16,
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