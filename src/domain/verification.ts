export type VerifyPublicResult =
  | {
      status: 'unverified'
    }
  | {
      status: 'verified'
      kind: 'producto' | 'pieza'
      nombre: string
      issued_at: string
      image_url: string | null
      brand_name: string | null
      signature: string
      qr_exp: string
      chain_valid?: boolean 
    }
  | {
      status: 'revoked' | 'replaced'
      kind: 'producto' | 'pieza'
      nombre: string
      issued_at: string
      image_url: string | null
      brand_name: string | null
      signature: string
      qr_exp: string
    }
    
export type VerificationViewState =
  | { state: 'verified'; data: Extract<VerifyPublicResult, { status: 'verified' }> }
  | { state: 'revoked' }
  | { state: 'replaced' }
  | { state: 'unverified' }
  | { state: 'error'; message: string }