import React from 'react';
import { View, Text } from 'react-native';

export function OfflineScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Sin conexión</Text>
      <Text>No es posible verificar sin acceso a la red</Text>
    </View>
  );
}
