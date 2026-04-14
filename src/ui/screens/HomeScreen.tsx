import React from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/navigation/RootNavigator';
import { colors, spacing, typography } from '@/theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Logo */}
      <Image
        source={require('@/assets/images/pinealid-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={[styles.title, typography.title]}>
        PinealID
      </Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, typography.body]}>
        Private Trust Verification Layer
      </Text>

      {/* CTA */}
      <Pressable
        onPress={() => navigation.navigate('Scan')}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>
          Escanear certificación
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Legal')}>
        <Text style={styles.legalLink}>
          Legal · Privacidad
        </Text>
      </Pressable>

      {/* Version */}
      <Text style={styles.version}>
        PinealID · 2026.02
      </Text>

      <Text style={{ color: 'white', marginTop: 20 }}>
        PinealID v1.0.3
      </Text>
    </View>

  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  
  logo: {
    width: 88,
    height: 88,
    marginBottom: spacing.lg,
  },

  title: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  subtitle: {
    color: colors.textSecondary,
    opacity: 0.75,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },

  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonText: {
    color: '#000',
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  version: {
    position: 'absolute',
    bottom: 24,
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
  },

   legalLink: {
    marginTop: spacing.lg,
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 0.4,
    },
});
