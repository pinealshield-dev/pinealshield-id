import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'

export type RiskLevel =
  | 'low'
  | 'medium'
  | 'high'

export type DeviceTrustResult = {
  isEmulator: boolean
  isDebugBuild: boolean
  riskLevel: RiskLevel
  score: number
  reasons: string[]
  platform: string
  systemVersion: string
  appVersion: string
}

export async function getDeviceTrust(): Promise<DeviceTrustResult> {
  const reasons: string[] = []
  let score = 0

  const isEmulator =
    await DeviceInfo.isEmulator()

  if (isEmulator) {
    reasons.push('emulator_detected')
    score += 70
  }

  const isDebugBuild = __DEV__

  if (isDebugBuild) {
    reasons.push('debug_build')
    score += 30
  }

  let riskLevel: RiskLevel = 'low'

  if (score >= 70) {
    riskLevel = 'high'
  } else if (score >= 30) {
    riskLevel = 'medium'
  }

  return {
    isEmulator,
    isDebugBuild,
    riskLevel,
    score,
    reasons,
    platform: Platform.OS,
    systemVersion: DeviceInfo.getSystemVersion(),
    appVersion: DeviceInfo.getVersion(),
  }
}