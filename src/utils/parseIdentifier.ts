/**
 * QR / NFC input is UNTRUSTED.
 * This function only normalizes and extracts a candidate identifier.
 * It NEVER decides authenticity.
 */
export function parseIdentifier(raw: string): string | null {
  try {
    const value = raw.trim();

    // URL-style identifier (manual parsing, RN-safe)
    if (value.startsWith('http')) {
      const match = value.match(/^https?:\/\/([^/]+)\/(.+)$/i);
      if (!match) return null;

      const host = match[1];
      const path = match[2];

      const allowedHosts = ['verify.pinealshield.com'];
      if (!allowedHosts.includes(host)) return null;

      const parts = path.split('/').filter(Boolean);
      if (parts.length >= 2 && parts[0] === 'verify') {
        return parts[1]; // hash / id
      }

      return null;
    }

    // Direct global identifier (hash / short id)
    if (/^[a-zA-Z0-9_-]{16,128}$/.test(value)) {
      return value;
    }

    return null;
  } catch {
    return null;
  }
}
