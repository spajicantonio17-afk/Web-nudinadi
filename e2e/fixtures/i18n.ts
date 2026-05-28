import bs from '../../src/lib/i18n/translations/bs'

export type TranslationKey = keyof typeof bs

export function t(key: string): string {
  const value = (bs as Record<string, string>)[key]
  if (!value) throw new Error(`Missing i18n key in bs.ts: ${key}`)
  return value
}

export const TEST_USERS = {
  alice: {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    email: 'e2e-alice@nudinadi.test',
    password: 'Passw0rd!Alice',
    username: 'alice_e2e',
    fullName: 'Alice E2E',
  },
  bob: {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    email: 'e2e-bob@nudinadi.test',
    password: 'Passw0rd!Bob',
    username: 'bob_e2e',
    fullName: 'Bob E2E',
  },
} as const

export const TEST_PRODUCT_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc'

export const SUPABASE_LOCAL = {
  url: 'http://127.0.0.1:54321',
  inbucketUrl: 'http://127.0.0.1:54324',
} as const
