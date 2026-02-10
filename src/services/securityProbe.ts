// src/services/securityProbe.ts

import { ENV } from '@/config/env';

export async function probePrivateTable(): Promise<any> {
  const res = await fetch(
    `${ENV.SUPABASE_URL}/rest/v1/productos?limit=1`,
    {
      headers: {
        apikey: ENV.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
      },
    }
  );

  return {
    status: res.status,
    body: await res.text(),
  };
}
