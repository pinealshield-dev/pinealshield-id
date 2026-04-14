import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { MainTabs } from './MainTabs'

export type RootStackParamList = {
  Home: undefined
  Scan: undefined
  Result: { status: string; raw?: string }
  Offline: undefined
  Legal: undefined
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  )
}