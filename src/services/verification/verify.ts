import { VerificationResponse } from './types';

/**
 * Mock controlado.
 * Reemplazaremos esto cuando tengamos API real.
 */
export async function verifyIdentifier(
  _identifier: string
): Promise<VerificationResponse> {
  return {
    status: 'authentic',
    verifiedAt: new Date().toISOString(),
  };
}