import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Pineal ID</Text>
      <Text>Infraestructura privada de verificación</Text>

      <Pressable
        onPress={() => navigation.navigate('Scan')}
        style={{ marginTop: 16, padding: 12, borderWidth: 1 }}
      >
        <Text>Escanear QR</Text>
      </Pressable>
    </View>
  );
}
