export type VerificationStatus =
  | 'authentic'
  | 'invalid'
  | 'revoked'
  | 'expired'
  | 'not_found'
  | 'error';

export interface VerificationResponse {
  status: VerificationStatus;
  verifiedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
  evidenceId?: string;

  // Fase 2 (integridad)
  signature?: string;
  kid?: string;
}
