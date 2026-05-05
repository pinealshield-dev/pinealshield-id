export type VerifyEntity = 'artifact' | 'artifact_piece' | 'document'

export type VerifyKind = 'producto' | 'pieza' | 'document'

export type VerifyStatus =
  | 'verified'
  | 'revoked'
  | 'replaced'
  | 'unverified'

type VerifyBaseResult = {
  status: Exclude<VerifyStatus, 'unverified'>
  entity: VerifyEntity
  kind: VerifyKind
  nombre: string
  hash?: string
  issued_at: string
  image_url: string | null
  brand_name?: string | null
  source_entity?: string | null
  source_entity_id?: string | null
  issuer_status?: string | null
  verification_origin?: string | null
  signature?: string
  qr_exp?: string
  chain_valid?: boolean
  history?: Record<string, unknown>
}

export type VerifyArtifactResult = VerifyBaseResult & {
  entity: 'artifact'
  kind: 'producto'
  artifact_id: string
}

export type VerifyArtifactPieceResult = VerifyBaseResult & {
  entity: 'artifact_piece'
  kind: 'pieza'
  artifact_id?: string
  artifact_piece_id: string
}

export type VerifyDocumentResult = VerifyBaseResult & {
  entity: 'document'
  kind: 'document'
  document_id: string
  holder_name?: string | null
  holder_identifier?: string | null
  file_url?: string | null
}

export type VerifyUnverifiedResult = {
  status: 'unverified'
  chain_valid?: false
  history?: Record<string, unknown>
}

export type VerifyPublicResult =
  | VerifyArtifactResult
  | VerifyArtifactPieceResult
  | VerifyDocumentResult
  | VerifyUnverifiedResult

export type VerificationViewState =
  | {
      state: 'verified'
      data: Extract<VerifyPublicResult, { status: 'verified' }>
    }
  | {
      state: 'revoked'
      data: Extract<VerifyPublicResult, { status: 'revoked' }>
    }
  | {
      state: 'replaced'
      data: Extract<VerifyPublicResult, { status: 'replaced' }>
    }
  | { state: 'unverified' }
  | { state: 'error'; message: string }