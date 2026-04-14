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
type Nav = NativeStackNavigationProp<
  RootStackParamList,
  'Result'
>;

export function ResultScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();

  const { status, raw } = route.params ?? {};

  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<VerifyPublicResult | null>(null);

  useEffect(() => {
    if (status !== 'scanned' || !raw) return;

    let mounted = true;
    const controller = new AbortController();

    setLoading(true);

    verifyByHashPublic(raw, controller.signal)
      .then((res) => {
        if (!mounted) return;

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
        if (mounted) setResult({ status: 'unverified' });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [status, raw]);

  if (status === 'invalid') {
    return <StateScreen title="Código inválido" subtitle="El identificador no corresponde a un registro Pineal Shield." />;
  }

  if (loading) {
    return (
      <StateScreen
        loading
        title="Verificando"
        subtitle="Consultando infraestructura Pineal Shield..."
      />
    );
  }

  if (!result || result.status === 'unverified') {
    return (
      <StateScreen
        title="Registro no encontrado"
        subtitle="No existe un registro verificable en este momento."
        button="Intentar nuevamente"
        onPress={() => navigation.replace('Scan')}
      />
    );
  }

  const isVerified = result.status === 'verified';

  const chainValid = isVerified
    ? result.chain_valid ?? true
    : true;


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>
        PINEAL SHIELD REGISTRY
      </Text>

      <Text style={styles.title}>
        {chainValid
          ? 'Registro verificado'
          : 'Registro detectado'}
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
          Integridad criptográfica
        </Text>

        <Text style={styles.heroValue}>
          {chainValid
            ? 'CADENA CONSISTENTE'
            : 'CONSISTENCIA LIMITADA'}
        </Text>

        <Text style={styles.heroText}>
          {chainValid
            ? 'El registro pertenece a una secuencia verificable dentro del sistema.'
            : 'El registro existe, pero la continuidad técnica no pudo validarse completamente.'}
        </Text>
      </View>

      <Card>
        <Field label="Tipo" value={cap(result.kind)} />
        <Field label="Nombre" value={result.nombre} />
        <Field
          label="Emitido"
          value={date(result.issued_at)}
        />
        <Field
          label="Firma"
          value={result.signature ?? 'Pineal Shield Registry'}
        />
        <Field
          label="Verificación"
          value="Pineal Shield Registry"
        />

        {result.brand_name ? (
          <Field
            label="Marca"
            value={result.brand_name}
          />
        ) : null}
      </Card>

      <Card>
        <Field
          label="Identificador"
          value={mask(raw!)}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>
          Actividad de verificación
        </Text>

        <Text style={styles.sectionText}>
          Este registro ha sido consultado dentro de la infraestructura Pineal Shield.
        </Text>

        <Text style={styles.sectionMuted}>
          El detalle visible puede limitarse por seguridad.
        </Text>
      </Card>

      <Pressable
        style={styles.button}
        onPress={() => navigation.replace('Scan')}
      >
        <Text style={styles.buttonText}>
          Verificar otro código
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function StateScreen({
  title,
  subtitle,
  loading,
  button,
  onPress,
}: any) {
  return (
    <View style={styles.center}>
      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      )}

      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateSub}>{subtitle}</Text>

      {button && (
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
  );
}

function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View style={styles.card}>{children}</View>;
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function mask(v: string) {
  if (v.length <= 12) return v;
  return `${v.slice(0, 6)}…${v.slice(-6)}`;
}

function cap(v: string) {
  return v.charAt(0).toUpperCase() + v.slice(1);
}

function date(v: string) {
  try {
    return new Date(v).toLocaleString();
  } catch {
    return v;
  }
}

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
  },

  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '700',
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },

  heroText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },

  card: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 14,
  },

  fieldLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 3,
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
    marginBottom: 8,
  },

  sectionText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },

  sectionMuted: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 8,
  },

  stateTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center',
  },

  stateSub: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 320,
  },

  button: {
    marginTop: 22,
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
});