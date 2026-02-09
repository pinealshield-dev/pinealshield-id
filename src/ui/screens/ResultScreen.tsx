import React from 'react';
import { View, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';

export function ResultScreen() {
  const route = useRoute<any>();
  const { status, raw } = route.params ?? {};

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Resultado</Text>
      <Text>Estado: {status}</Text>
      {raw ? <Text>Dato: {raw}</Text> : null}
    </View>
  );
}
