import { ENV } from '@/config/env'
import type { VerifyPublicResult } from '@/domain/verification'
import { getDeviceId } from '@/security/deviceIdentity'
import { VerifySchema } from '@/domain/verify.schema'
import { nanoid } from 'nanoid/non-secure'

// ==================================================
// CACHE LOCAL DE DEVICE ID
// Evita recalcular fingerprint en cada scan
// ==================================================
let cachedDeviceId: string | null = null

// ==================================================
// EVITA REQUESTS DUPLICADOS DEL MISMO QR
// Si ya hay una consulta en curso del mismo hash,
// reutiliza la misma Promise.
// ==================================================
const inFlight = new Map<string, Promise<VerifyPublicResult>>()

// ==================================================
// ERROR CONTROLADO PARA OFFLINE / RED / TIMEOUT
// ==================================================
export class VerifyOfflineError extends Error {
  constructor() {
    super('OFFLINE')
    this.name = 'VerifyOfflineError'
  }
}

export async function verifyByHashPublic(
  hash: string,
  signal?: AbortSignal
): Promise<VerifyPublicResult> {
  // ----------------------------------------------
  // VALIDACIÓN BÁSICA INPUT
  // ----------------------------------------------
  if (!hash || typeof hash !== 'string') {
    return { status: 'unverified' }
  }

  const trimmedHash = hash.trim()

  if (trimmedHash.length < 6) {
    return { status: 'unverified' }
  }

  // ----------------------------------------------
  // IDEMPOTENCIA LOCAL
  // ----------------------------------------------
  if (inFlight.has(trimmedHash)) {
    return inFlight.get(trimmedHash)!
  }

  const promise: Promise<VerifyPublicResult> = (async () => {
    const controller = new AbortController()

    const timeout = setTimeout(() => {
      controller.abort()
    }, ENV.HTTP_TIMEOUT_MS)

    const abortSignal = signal ?? controller.signal

    try {
      // ==========================================
      // DEVICE ID
      // ==========================================
      let deviceId = cachedDeviceId

      if (!deviceId) {
        deviceId = await getDeviceId()
        cachedDeviceId = deviceId
      }

      if (!deviceId) {
        throw new VerifyOfflineError()
      }

      // ==========================================
      // CONTEXTO DE AUDITORÍA
      // ==========================================
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

      // ==========================================
      // HTTP FAIL
      // 500+ => backend caído
      // otros => unverified
      // ==========================================
      if (!res.ok) {
        if (res.status >= 500) {
          throw new VerifyOfflineError()
        }

        return { status: 'unverified' }
      }

      const json = await res.json()

      // respuesta corrupta
      if (!json || typeof json.status !== 'string') {
        return { status: 'unverified' }
      }

      // no existe registro
      if (json.status === 'unverified') {
        return { status: 'unverified' }
      }

      // ==========================================
      // VALIDACIÓN ESTRUCTURAL
      // ==========================================
      const parsed = VerifySchema.safeParse(json)

      if (!parsed.success) {
        console.log('[VERIFY] Invalid schema:', parsed.error)
        return { status: 'unverified' }
      }

      // Cast seguro porque ya validó Zod
      return parsed.data as VerifyPublicResult

    } catch (err: any) {
      // timeout
      if (err?.name === 'AbortError') {
        console.log('[VERIFY] Timeout reached')
        throw new VerifyOfflineError()
      }

      // offline controlado
      if (err instanceof VerifyOfflineError) {
        console.log('[VERIFY] Offline detected')
        throw err
      }

      // fetch network error
      console.log('[VERIFY] Network/Error:', err)
      throw new VerifyOfflineError()

    } finally {
      clearTimeout(timeout)
      inFlight.delete(trimmedHash)
    }
  })()

  inFlight.set(trimmedHash, promise)

  return promise
}