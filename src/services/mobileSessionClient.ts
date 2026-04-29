import { ENV } from '@/config/env'
import { getDeviceId } from '@/security/deviceIdentity'

async function rpc(
  fn: string,
  body: Record<string, unknown>
) {
  const res = await fetch(
    `${ENV.SUPABASE_URL}/rest/v1/rpc/${fn}`,
    {
      method: 'POST',
      headers: {
        apikey: ENV.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  const json = await res.json()

  const data = Array.isArray(json)
    ? json[0]?.[fn] ?? json[0]
    : json?.[fn] ?? json

  if (!res.ok || data?.ok === false) {
    throw new Error(data?.error ?? 'rpc_error')
  }

  return data
}

export async function refreshMobileSession() {
  const deviceId = await getDeviceId()

  return rpc('refresh_mobile_session', {
    p_device_id: deviceId,
  })
}

export async function logoutMobileSession() {
  const deviceId = await getDeviceId()

  return rpc('logout_mobile_session', {
    p_device_id: deviceId,
  })
}