import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { verifyByHashPublic } from '@/services/verifyClient';
import type { VerifyPublicResult } from '@/domain/verification';

type RouteParams = {
  status: string;
  raw?: string;
};

type ViewState =
  | { state: 'loading' }
  | { state: 'verified'; data: Extract<VerifyPublicResult, { status: 'verified' }> }
  | { state: 'unverified' }
  | { state: 'error' };

export function ResultScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { status, raw } = (route.params ?? {}) as RouteParams;

  const [view, setView] = useState<ViewState>({ state: 'loading' });

  useEffect(() => {
    let mounted = true;

    async function runVerification(hash: string) {
      try {
        const result = await verifyByHashPublic(hash);

        if (!mounted) return;

        if (result.status === 'verified') {
          setView({ state: 'verified', data: result });
        } else {
          setView({ state: 'unverified' });
        }
      } catch {
        if (mounted) {
          setView({ state: 'error' });
        }
      }
    }

    if (status !== 'scanned' || !raw) {
      setView({ state: 'unverified' });
      return;
    }

    runVerification(raw);

    return () => {
      mounted = false;
    };
  }, [status, raw]);

  // ===== RENDER =====

  if (view.state === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
        <Text>Validando evidencia…</Text>
      </View>
    );
  }

  if (view.state === 'verified') {
    const { data } = view;

    return (
      <View style={{ flex: 1, padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          Evidencia verificada
        </Text>

        <Text>Tipo: {data.kind}</Text>
        <Text>Nombre: {data.nombre}</Text>
        {data.brand_name ? <Text>Marca: {data.brand_name}</Text> : null}
        <Text>Emitido: {data.issued_at}</Text>

        <Text style={{ marginTop: 12, opacity: 0.7 }}>
          La autenticidad fue validada por la infraestructura de confianza
          Pineal Shield.
        </Text>
      </View>
    );
  }

  if (view.state === 'unverified') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 16 }}>
          Evidencia no verificada
        </Text>
        <Text style={{ marginTop: 8, opacity: 0.7 }}>
          No fue posible validar la autenticidad del identificador.
        </Text>
      </View>
    );
  }

  // error
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Error de validación</Text>
      <Text style={{ marginTop: 8, opacity: 0.7 }}>
        Intente nuevamente más tarde.
      </Text>
    </View>
  );
}
