// ===========================================
// NudiNađi - Admin Route Validation Schemas
// ===========================================

import { z } from 'zod/v4'

// /api/admin/reports - query params
export const reportsQuerySchema = z.object({
  status: z.enum(['pending', 'reviewing', 'approved', 'rejected', 'escalated']).optional(),
  reason: z.enum(['spam', 'scam', 'prohibited_content', 'duplicate', 'inappropriate', 'fake_listing', 'personal_info', 'other']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

// /api/admin/reports/[id] - PATCH body
export const reportUpdateSchema = z.object({
  status: z.enum(['pending', 'reviewing', 'approved', 'rejected', 'escalated']),
  resolution_note: z.string().max(2000).optional(),
})

// /api/admin/actions - POST body
export const actionSchema = z.object({
  action_type: z.enum(['approve', 'reject', 'warn', 'ban', 'unban', 'escalate', 'dismiss']),
  report_id: z.string().uuid().optional(),
  target_user_id: z.string().uuid().optional(),
  target_product_id: z.string().uuid().optional(),
  reason: z.string().max(2000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// /api/admin/users - query params
export const usersQuerySchema = z.object({
  search: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

// /api/admin/users/[id]/ban - POST body
export const banSchema = z.object({
  reason: z.string().min(1, 'Razlog je obavezan').max(2000),
  expires_at: z.string().datetime().optional(),
})

// /api/admin/users/[id]/warn - POST body
export const warnSchema = z.object({
  reason: z.string().min(1, 'Razlog je obavezan').max(2000),
  severity: z.number().int().min(1).max(5).default(1),
  report_id: z.string().uuid().optional(),
})
