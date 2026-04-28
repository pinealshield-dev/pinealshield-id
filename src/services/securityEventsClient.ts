import { ENV } from '@/config/env'
import { getDeviceId } from '@/security/deviceIdentity'

export async function registerSecurityEvent(
  eventType: string,
  severity: string = 'info',
  metadata: Record<string, any> = {}
) {
  try {
    const deviceId = await getDeviceId()

    const payload = {
      p_device_id: deviceId,
      p_event_type: eventType,
      p_severity: severity,
      p_platform: 'android',
      p_app_version: ENV.APP_VERSION,
      p_metadata: metadata,
    }

    const res = await fetch(
      `${ENV.SUPABASE_URL}/rest/v1/rpc/register_mobile_security_event`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: ENV.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    )

    if (!res.ok) {
      console.log('[SECURITY_EVENT] HTTP error')
      return
    }

    const json = await res.json()
    console.log('[SECURITY_EVENT]', json)
  } catch (err) {
    console.log('[SECURITY_EVENT] fail', err)
  }
}