import { ENV } from '@/config/env'
import { getDeviceId } from '@/security/deviceIdentity'

export async function getMobileIdentity() {
  try {
    const deviceId = await getDeviceId()

    const res = await fetch(
      `${ENV.SUPABASE_URL}/rest/v1/rpc/get_mobile_identity`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: ENV.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          p_device_id: deviceId,
        }),
      }
    )

    if (!res.ok) return null

    return await res.json()
  } catch {
    return null
  }
}