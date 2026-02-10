// src/utils/parseIdentifier.ts

import { ENV } from '@/config/env';

/**
 * Normaliza input NO confiable (QR / texto)
 * No decide autenticidad.
 */
export function parseIdentifier(raw: string): string | null {
  const value = raw.trim();

  // URL-style QR
  if (value.startsWith('http')) {
    const match = value.match(/^https?:\/\/([^/]+)\/(.+)$/i);
    if (!match) return null;

    const host = match[1];
    const path = match[2];

    if (!ENV.ALLOWED_HOSTS.includes(host)) return null;

    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[0] === 'verify') {
      return parts[1]; // hash
    }

    return null;
  }

  // Hash directo (global)
  if (/^[a-zA-Z0-9_-]{16,128}$/.test(value)) {
    return value;
  }

  return null;
}
