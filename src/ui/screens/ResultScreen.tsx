import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import type { RootStackParamList } from '@/navigation/RootNavigator';
import { verifyByHashPublic } from '@/services/verifyClient';
import type { VerifyPublicResult } from '@/domain/verification';

type Route = RouteProp<RootStackParamList, 'Result'>;

export function ResultScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();

  const { status, raw } = route.params ?? {};

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyPublicResult | null>(null);

  useEffect(() => {
    // Estados que no requieren backend
    if (status !== 'scanned' || !raw) {
      return;
    }

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

  /* ===============================
     Render helpers
  =============================== */

  if (status === 'invalid') {
    return (
      <Centered>
        <Text style={styles.title}>Código no válido</Text>
        <Text style={styles.text}>
          El código escaneado no corresponde a un identificador Pineal Shield.
        </Text>
      </Centered>
    );
  }

  if (status !== 'scanned' || !raw) {
    return (
      <Centered>
        <Text style={styles.title}>Estado no reconocido</Text>
      </Centered>
    );
  }

  if (loading) {
    return (
      <Centered>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Verificando autenticidad…</Text>
      </Centered>
    );
  }

  if (!result || result.status === 'unverified') {
    return (
      <Centered>
        <Text style={[styles.title, styles.unverified]}>
          Certificación no verificada
        </Text>
        <Text style={styles.text}>
          No existe un registro válido asociado a este identificador.
        </Text>
      </Centered>
    );
  }

  /* ===============================
     VERIFIED
  =============================== */

  return (
    <View style={styles.container}>
      <Text style={[styles.title, styles.verified]}>
        Certificación válida · Pineal Shield®
      </Text>

      <View style={styles.card}>
        <Label label="Tipo" value={capitalize(result.kind)} />
        <Label label="Nombre" value={result.nombre} />
        <Label
          label="Registrado"
          value={formatDate(result.issued_at)}
        />
        {result.brand_name && (
          <Label label="Marca" value={result.brand_name} />
        )}
      </View>

      <View style={styles.cardSecondary}>
        <Text style={styles.small}>
          Hash verificado
        </Text>
        <Text style={styles.mono}>
          {obfuscate(raw)}
        </Text>
      </View>
    </View>
  );
}

/* ===============================
   UI Helpers
=============================== */

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.centered}>
      {children}
    </View>
  );
}

function Label({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

/* ===============================
   Utils (local, pure)
=============================== */

function obfuscate(hash: string): string {
  if (hash.length <= 10) return hash;
  return `${hash.slice(0, 4)}…${hash.slice(-4)}`;
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

/* ===============================
   Styles
=============================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#0b0b0b',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0b0b0b',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#eaeaea',
    marginBottom: 12,
    textAlign: 'center',
  },
  verified: {
    color: '#19c37d',
  },
  unverified: {
    color: '#e5533d',
  },
  text: {
    color: '#bdbdbd',
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  cardSecondary: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#111',
  },
  row: {
    marginBottom: 8,
  },
  label: {
    color: '#8a8a8a',
    fontSize: 12,
    marginBottom: 2,
  },
  value: {
    color: '#eaeaea',
    fontSize: 14,
  },
  small: {
    color: '#8a8a8a',
    fontSize: 12,
    marginBottom: 4,
  },
  mono: {
    fontFamily: 'monospace',
    color: '#eaeaea',
  },
});
