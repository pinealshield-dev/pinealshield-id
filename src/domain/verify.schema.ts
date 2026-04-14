import { z } from 'zod'

export const VerifySchema = z.union([
  z.object({
    status: z.literal('unverified'),
  }),
  z.object({
    status: z.enum(['verified', 'revoked', 'replaced']),
    kind: z.enum(['producto', 'pieza']),
    nombre: z.string(),
    issued_at: z.string(),
    image_url: z.string().nullable(),
    brand_name: z.string().nullable(),
    signature: z.string(),
    qr_exp: z.string(),
  }),
])

export type VerifyPublicResult = z.infer<typeof VerifySchema>