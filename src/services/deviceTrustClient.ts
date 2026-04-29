import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'

export type DeviceTrustResult = {
  isEmulator: boolean
  isDebugging: boolean
  riskLevel: 'low' | 'medium' | 'high'
  reasons: string[]
}

export async function getDeviceTrust(): Promise<DeviceTrustResult> {
  const reasons: string[] = []

  const isEmulator =
    await DeviceInfo.isEmulator()

  if (isEmulator) {
    reasons.push('emulator_detected')
  }

  const isDebugging = __DEV__

  if (isDebugging) {
    reasons.push('debug_build')
  }

  let riskLevel: 'low' | 'medium' | 'high' =
    'low'

  if (reasons.length === 1) {
    riskLevel = 'medium'
  }

  if (reasons.length >= 2) {
    riskLevel = 'high'
  }

  return {
    isEmulator,
    isDebugging,
    riskLevel,
    reasons,
  }
}