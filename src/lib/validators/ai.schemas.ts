// ===========================================
// NudiNađi - AI Route Validation Schemas
// ===========================================

import { z } from 'zod/v4'

// /api/ai/analyze
export const analyzeSchema = z.object({
  action: z.enum(['full', 'ocr']).default('full'),
  image: z.string().min(1, 'Slika je obavezna'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']).default('image/jpeg'),
})

// /api/ai/search
export const searchSchema = z.object({
  query: z.string().min(1, 'Upit za pretragu je obavezan').max(500),
})

// /api/ai/moderate
export const moderateSchema = z.discriminatedUnion('action', [
  // Duplicate check
  z.object({
    action: z.literal('duplicate'),
    title: z.string().min(1, 'Naslov je obavezan').max(200),
    category: z.string().optional(),
    description: z.string().max(5000).optional(),
    productId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
  }),
  // Content moderation
  z.object({
    action: z.literal('moderate'),
    title: z.string().min(1, 'Naslov je obavezan').max(200),
    description: z.string().max(5000).optional(),
    price: z.number().positive().optional(),
    category: z.string().optional(),
    images: z.number().int().nonnegative().optional(),
    productId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
  }),
  // Trust score
  z.object({
    action: z.literal('trust'),
    totalListings: z.number().int().nonnegative().default(0),
    successfulSales: z.number().int().nonnegative().default(0),
    rating: z.number().min(0).max(5).default(0),
    reviewCount: z.number().int().nonnegative().default(0),
    accountAgeDays: z.number().int().nonnegative().default(0),
    hasAvatar: z.boolean().default(false),
    hasPhone: z.boolean().default(false),
    hasEmail: z.boolean().default(false),
    userId: z.string().uuid().optional(),
  }),
])

// /api/ai/enhance
export const enhanceSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('title'),
    title: z.string().min(1, 'Naslov je obavezan').max(200),
    category: z.string().optional(),
  }),
  z.object({
    action: z.literal('description'),
    title: z.string().min(1, 'Naslov je obavezan').max(200),
    description: z.string().max(5000).optional(),
    category: z.string().optional(),
    price: z.number().positive().optional(),
  }),
  z.object({
    action: z.literal('quality'),
    title: z.string().min(1, 'Naslov je obavezan').max(200),
    description: z.string().max(5000).optional(),
    category: z.string().optional(),
    images: z.number().int().nonnegative().optional(),
    price: z.number().positive().optional(),
  }),
  z.object({
    action: z.literal('tags'),
    title: z.string().min(1, 'Naslov je obavezan').max(200),
    description: z.string().max(5000).optional(),
    category: z.string().optional(),
  }),
  z.object({
    action: z.literal('categorize'),
    title: z.string().min(1, 'Naslov ili opis je obavezan').max(500),
    description: z.string().max(5000).optional(),
  }),
  z.object({
    action: z.literal('vin'),
    vin: z.string().length(17, 'VIN mora imati 17 znakova'),
  }),
])

// /api/ai/import
export const importSchema = z.object({
  url: z.string().url('Nevažeći URL — mora počinjati sa http:// ili https://'),
})
