import { ENV } from '@/config/env'
import type { VerifyPublicResult } from '@/domain/verification'
import { getDeviceId } from '@/security/deviceIdentity'
import { VerifySchema } from '@/domain/verify.schema'
import { nanoid } from 'nanoid/non-secure'

// 🔒 cache en memoria
let cachedDeviceId: string | null = null

// 🔒 evita múltiples scans simultáneos
const inFlight = new Map<string, Promise<VerifyPublicResult>>()

export async function verifyByHashPublic(
  hash: string,
  signal?: AbortSignal
): Promise<VerifyPublicResult> {

  if (!hash || typeof hash !== 'string') {
    return { status: 'unverified' as const }
  }

  const trimmedHash = hash.trim()

  if (trimmedHash.length < 6) {
    return { status: 'unverified' as const }
  }

  // 🔴 idempotencia cliente
  if (inFlight.has(trimmedHash)) {
    return inFlight.get(trimmedHash)!
  }

  const promise = (async () => {

    const controller = new AbortController()
    const timeout = setTimeout(
      () => controller.abort(),
      ENV.HTTP_TIMEOUT_MS
    )

    const abortSignal = signal ?? controller.signal

    try {

      // ===========================
      // DEVICE ID
      // ===========================

      let deviceId = cachedDeviceId

      if (!deviceId) {
        deviceId = await getDeviceId()
        cachedDeviceId = deviceId
      }

      if (!deviceId) {
        throw new Error('Device ID required')
      }

      // ===========================
      // CONTEXTO (CORRECTO)
      // ===========================

      const context = {
        type: 'pinealid_mobile',
        device_id: deviceId,
        trace_id: nanoid(12),
        platform: 'android',
        app_version: ENV.APP_VERSION,
        scan_type: 'qr',
        timestamp: new Date().toISOString(),
      }

      const payload = {
        p_identifier: trimmedHash,
        p_context: context,
      }

      console.log('[VERIFY] PAYLOAD:', JSON.stringify(payload))

      const url = `${ENV.SUPABASE_URL}${ENV.RPC_VERIFY_PATH}`

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: ENV.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
        signal: abortSignal,
      })

      if (!res.ok) {
        return { status: 'unverified' as const }
      }

      const json = await res.json()

      if (!json || typeof json.status !== 'string') {
        return { status: 'unverified' as const }
      }

      if (json.status === 'unverified') {
        return { status: 'unverified' as const }
      }

      // ===========================
      // VALIDACIÓN FUERTE
      // ===========================

      const parsed = VerifySchema.safeParse(json)

      if (!parsed.success) {
        console.log('[VERIFY] Invalid schema:', parsed.error)
        return { status: 'unverified' as const }
      }

      return parsed.data

    } catch (err: any) {

      if (err?.name === 'AbortError') {
        console.log('[VERIFY] Timeout reached')
      } else {
        console.log('[VERIFY] Network/Error:', err)
      }

      return { status: 'unverified' as const }

    } finally {
      clearTimeout(timeout)
      inFlight.delete(trimmedHash)
    }

  })()

  inFlight.set(trimmedHash, promise)

  return promise
}