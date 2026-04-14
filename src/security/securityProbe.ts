import { getDeviceId } from './deviceIdentity'
import { Platform } from 'react-native'
import { ENV } from '@/config/env'

export async function buildSecurityContext() {
  const device_id = await getDeviceId()

  return {
    verifier_context: {
      type: 'pinealid_mobile',
      device_id,
      platform: Platform.OS,
      app_version: ENV.APP_VERSION,
      ts: new Date().toISOString(),
    },
  }
}