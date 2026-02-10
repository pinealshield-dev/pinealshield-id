// src/services/verifyClient.ts

import { ENV } from '@/config/env';
import type { VerifyPublicResult } from '@/domain/verification';

export async function verifyByHashPublic(
  hash: string,
  signal?: AbortSignal
): Promise<VerifyPublicResult> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    ENV.HTTP_TIMEOUT_MS
  );

  const abortSignal = signal ?? controller.signal;

  try {
    const res = await fetch(
      `${ENV.SUPABASE_URL}${ENV.RPC_VERIFY_PATH}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: ENV.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ p_hash: hash }),
        signal: abortSignal,
      }
    );

    if (!res.ok) {
      return { status: 'unverified' };
    }

    const json = (await res.json()) as VerifyPublicResult;

    if (!json || (json.status !== 'verified' && json.status !== 'unverified')) {
      return { status: 'unverified' };
    }

    return json;
  } catch {
    return { status: 'unverified' };
  } finally {
    clearTimeout(timeout);
  }
}
