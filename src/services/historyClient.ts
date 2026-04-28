import { ENV } from '@/config/env'
import { getDeviceId } from '@/security/deviceIdentity'

export type HistoryStatus =
  | 'verified'
  | 'unverified'
  | 'revoked'
  | 'replaced'
  | 'unknown'

export type DeviceHistoryItem = {
  id: string
  created_at: string
  status: HistoryStatus
  identifier: string | null
  app_version: string | null
}

function normalizeStatus(value: unknown): HistoryStatus {
  if (
    value === 'verified' ||
    value === 'unverified' ||
    value === 'revoked' ||
    value === 'replaced'
  ) {
    return value
  }

  return 'unknown'
}

export async function getDeviceHistory(
  limit = 20
): Promise<DeviceHistoryItem[]> {
  const deviceId = await getDeviceId()

  const url = `${ENV.SUPABASE_URL}${ENV.RPC_HISTORY_PATH}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ENV.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      p_device_id: deviceId,
      p_limit: limit,
    }),
  })

  if (!res.ok) {
    throw new Error('HISTORY_FETCH_FAILED')
  }

  const json = await res.json()

  if (!Array.isArray(json)) {
    return []
  }

  return json.map((item) => ({
    id: String(item.id),
    created_at: String(item.created_at),
    status: normalizeStatus(item.status),
    identifier: item.identifier ?? null,
    app_version: item.app_version ?? null,
  }))
}