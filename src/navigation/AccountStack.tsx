import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { AccountScreen } from '@/ui/screens/AccountScreen'
import { LegalScreen } from '@/ui/screens/LegalScreen'

export type AccountStackParamList = {
  AccountHome: undefined
  Legal: undefined
}

const Stack = createNativeStackNavigator<AccountStackParamList>()

export function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="AccountHome"
        component={AccountScreen}
      />
      <Stack.Screen
        name="Legal"
        component={LegalScreen}
      />
    </Stack.Navigator>
  )
}