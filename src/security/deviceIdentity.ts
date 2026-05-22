// src/security/deviceIdentity.ts

import * as Keychain from 'react-native-keychain'
import { nanoid } from 'nanoid/non-secure'

const SERVICE = 'pineal_device_id'

export async function getDeviceId(): Promise<string> {
  try {
    // 1️⃣ Intentar recuperar ID existente
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE,
    })

    if (credentials) {
      return credentials.password
    }

    // 2️⃣ Generar nuevo ID
    const newId = nanoid()

    // 3️⃣ Guardarlo seguro en Keychain
    await Keychain.setGenericPassword(
      'device',
      newId,
      { service: SERVICE }
    )

    return newId

  } catch (err) {
    if (__DEV__) {
      console.log('[DEVICE_ID] error:', err)
    }

    // ⚠️ fallback SOLO para no romper flujo
    return `fallback-${Date.now()}`
  }
}