import { ENV } from '@/config/env'
import { getDeviceId } from '@/security/deviceIdentity'

export async function refreshMobileSession() {
  const deviceId = await getDeviceId()

  const res = await fetch(
    `${ENV.SUPABASE_URL}/rest/v1/rpc/refresh_mobile_session`,
    {
      method: 'POST',
      headers: {
        apikey: ENV.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_device_id: deviceId,
      }),
    }
  )

  const json = await res.json()

  if (!res.ok) {
    throw new Error('refresh_error')
  }

  return Array.isArray(json)
    ? json[0]?.refresh_mobile_session ?? {}
    : json?.refresh_mobile_session ?? json
}