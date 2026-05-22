import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from 'react-native-vector-icons/Ionicons'

import { VerifyStack } from './VerifyStack'
import { HistoryScreen } from '@/ui/screens/HistoryScreen'
import { AccountStack } from './AccountStack'
import { colors } from '@/theme'

const Tab = createBottomTabNavigator()

const tabBarStyle = {
  backgroundColor: '#050505',
  borderTopColor: '#111',
  height: 62,
  paddingBottom: 8,
  paddingTop: 6,
}

const tabBarLabelStyle = {
  fontSize: 12,
  marginBottom: 4,
}

function VerifyTabIcon({
  color,
  size,
}: {
  color: string
  size: number
}) {
  return (
    <Ionicons
      name="shield-checkmark-outline"
      size={size}
      color={color}
    />
  )
}

function HistoryTabIcon({
  color,
  size,
}: {
  color: string
  size: number
}) {
  return (
    <Ionicons
      name="time-outline"
      size={size}
      color={color}
    />
  )
}

function AccountTabIcon({
  color,
  size,
}: {
  color: string
  size: number
}) {
  return (
    <Ionicons
      name="person-outline"
      size={size}
      color={color}
    />
  )
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle,
      }}
    >
      <Tab.Screen
        name="Verificar"
        component={VerifyStack}
        options={{
          tabBarIcon: VerifyTabIcon,
        }}
      />

      <Tab.Screen
        name="Historial"
        component={HistoryScreen}
        options={{
          tabBarIcon: HistoryTabIcon,
        }}
      />

      <Tab.Screen
        name="Cuenta"
        component={AccountStack}
        options={{
          tabBarIcon: AccountTabIcon,
        }}
      />
    </Tab.Navigator>
  )
}