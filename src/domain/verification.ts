export type VerifyPublicResult =
  | {
      status: 'verified';
      kind: 'producto' | 'pieza';
      nombre: string;
      issued_at: string;
      image_url: string | null;
      brand_name: string | null;
      signature: string;
      qr_exp: string;
    }
  | {
      status: 'unverified';
    };

export type VerificationViewState =
  | { state: 'verified'; data: VerifyPublicResult & { status: 'verified' } }
  | { state: 'unverified' }
  | { state: 'error'; message: string };
