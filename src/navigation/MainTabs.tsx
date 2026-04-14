import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from 'react-native-vector-icons/Ionicons'

import { VerifyStack } from './VerifyStack'
import { HistoryScreen } from '@/ui/screens/HistoryScreen'
import { AccountStack } from './AccountStack'
import { colors } from '@/theme'

const Tab = createBottomTabNavigator()

const iconMap = {
  Verificar: 'shield-checkmark-outline',
  Historial: 'time-outline',
  Cuenta: 'person-outline',
} as const

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const icon =
          iconMap[route.name as keyof typeof iconMap] ??
          'ellipse'

        return {
          headerShown: false,

          tabBarStyle: {
            backgroundColor: '#050505',
            borderTopColor: '#111',
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },

          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: '#6b7280',

          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 4,
          },

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={icon}
              size={size}
              color={color}
            />
          ),
        }
      }}
    >
      <Tab.Screen
        name="Verificar"
        component={VerifyStack}
      />

      <Tab.Screen
        name="Historial"
        component={HistoryScreen}
      />

      <Tab.Screen
        name="Cuenta"
        component={AccountStack}
      />
    </Tab.Navigator>
  )
}