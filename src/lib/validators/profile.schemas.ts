// ===========================================
// NudiNađi - Profile Route Validation Schemas
// ===========================================

import { z } from 'zod/v4'

// /api/profile/update - POST body
export const profileUpdateSchema = z.object({
  username: z.string()
    .min(3, 'Username mora imati min. 3 znaka.')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Samo slova, brojevi i _.')
    .optional(),
  full_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  avatar_url: z.string().url().optional().nullable(),
})
