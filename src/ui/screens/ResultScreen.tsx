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
    return (
      <StateScreen
        title="Código inválido"
        subtitle="El identificador no corresponde a un registro oficial de Pineal Shield."
      />
    );
  }

  if (loading) {
    return (
      <StateScreen
        loading
        title="Validando autenticidad"
        subtitle="Consultando infraestructura segura de Pineal Shield..."
      />
    );
  }

  if (!result || result.status === 'unverified') {
    return (
      <StateScreen
        title="Registro no encontrado"
        subtitle="No existe un registro verificable en este momento dentro de Pineal Shield."
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
        BY PINEAL SHIELD
      </Text>

      <Text style={styles.title}>
        {chainValid
          ? 'Autenticidad verificada'
          : 'Registro detectado'}
      </Text>

      <Text style={styles.subtitleTop}>
        Cliente móvil oficial PinealID
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
            ? 'El registro pertenece a una secuencia verificable dentro del ecosistema Pineal Shield.'
            : 'El registro existe, pero la continuidad técnica no pudo validarse completamente.'}
        </Text>
      </View>

      <Card>
        <Field label="Nombre" value={result.nombre} />

        {result.brand_name ? (
          <Field
            label="Marca"
            value={result.brand_name}
          />
        ) : null}

        <Field label="Tipo" value={cap(result.kind)} />

        <Field
          label="Emitido"
          value={date(result.issued_at)}
        />

        <Field
          label="Firma"
          value={
            result.signature ??
            'Verified by Pineal Shield'
          }
        />

        <Field
          label="Motor de verificación"
          value="Pineal Shield Registry"
        />
      </Card>

      <Card>
        <Field
          label="Identificador"
          value={mask(raw!)}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>
          Actividad registrada
        </Text>

        <Text style={styles.sectionText}>
          Este registro fue consultado mediante PinealID dentro de la infraestructura Pineal Shield.
        </Text>

        <Text style={styles.sectionMuted}>
          Algunos detalles pueden limitarse por seguridad y trazabilidad.
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
  );
}

type StateScreenProps = {
  title: string;
  subtitle: string;
  loading?: boolean;
  button?: string;
  onPress?: () => void;
};

function StateScreen({
  title,
  subtitle,
  loading = false,
  button,
  onPress,
}: StateScreenProps) {
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

      {button && onPress ? (
        <Pressable
          style={styles.button}
          onPress={onPress}
        >
          <Text style={styles.buttonText}>
            {button}
          </Text>
        </Pressable>
      ) : null}

      <Text style={styles.stateFooter}>
        Cliente móvil oficial · Pineal Shield
      </Text>
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
    <View style={styles.fieldWrap}>
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
  if (!v) return '';
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
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 12,
  },

  subtitleTop: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: -4,
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
    letterSpacing: 0.4,
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

  fieldWrap: {
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

  stateEyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 2.2,
    marginBottom: 14,
  },

  stateBadge: {
    borderWidth: 1,
    borderColor: 'rgba(0,255,200,0.25)',
    backgroundColor: 'rgba(0,255,200,0.06)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 16,
  },

  stateBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  stateTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },

  stateSub: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 320,
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

  stateFooter: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 26,
    opacity: 0.8,
    textAlign: 'center',
  },

  footerBrand: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.8,
  },
});