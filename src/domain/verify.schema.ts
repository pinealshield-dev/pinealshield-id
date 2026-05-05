import { z } from 'zod'

const BaseVerifiedSchema = z.object({
  status: z.enum(['verified', 'revoked', 'replaced']),
  entity: z.enum(['artifact', 'artifact_piece', 'document']),
  kind: z.enum(['producto', 'pieza', 'document']),

  nombre: z.string(),
  hash: z.string().optional(),

  issued_at: z.string(),
  image_url: z.string().nullable(),

  brand_name: z.string().nullable().optional(),
  source_entity: z.string().nullable().optional(),
  source_entity_id: z.string().nullable().optional(),
  issuer_status: z.string().nullable().optional(),

  verification_origin: z.string().nullable().optional(),
  signature: z.string().optional(),
  qr_exp: z.string().optional(),

  chain_valid: z.boolean().optional(),
  history: z.record(z.string(), z.unknown()).optional(),
})

const ArtifactSchema = BaseVerifiedSchema.extend({
  entity: z.literal('artifact'),
  kind: z.literal('producto'),
  artifact_id: z.string(),
})

const ArtifactPieceSchema = BaseVerifiedSchema.extend({
  entity: z.literal('artifact_piece'),
  kind: z.literal('pieza'),
  artifact_id: z.string().optional(),
  artifact_piece_id: z.string(),
})

const DocumentSchema = BaseVerifiedSchema.extend({
  entity: z.literal('document'),
  kind: z.literal('document'),
  document_id: z.string(),
  holder_name: z.string().nullable().optional(),
  holder_identifier: z.string().nullable().optional(),
  file_url: z.string().nullable().optional(),
})

const UnverifiedSchema = z.object({
  status: z.literal('unverified'),
  chain_valid: z.literal(false).optional(),
  history: z.record(z.string(), z.unknown()).optional(),
})

export const VerifySchema = z.union([
  UnverifiedSchema,
  ArtifactSchema,
  ArtifactPieceSchema,
  DocumentSchema,
])

export type VerifyPublicResult = z.infer<typeof VerifySchema>