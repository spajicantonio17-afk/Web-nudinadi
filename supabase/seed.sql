-- ============================================================================
-- seed.sql — E2E Test Users + Test Data for Playwright
-- Auto-applied by `supabase start` and `supabase db reset`
-- ============================================================================
-- This file creates deterministic test users for E2E tests.
-- Passwords are bcrypt-hashed. Plain-text passwords:
--   e2e-alice@nudinadi.test → Passw0rd!Alice
--   e2e-bob@nudinadi.test   → Passw0rd!Bob
-- ============================================================================

-- ── Clean previous test state (idempotent) ─────────────────────────────────
DELETE FROM auth.users WHERE email LIKE 'e2e-%@nudinadi.test';

-- ── Alice (test user A — seller) ───────────────────────────────────────────
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'authenticated', 'authenticated',
  'e2e-alice@nudinadi.test',
  crypt('Passw0rd!Alice', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Alice E2E","username":"alice_e2e"}'::jsonb,
  false,
  '', '', '', ''
);

-- ── Bob (test user B — buyer/messaging counterpart) ────────────────────────
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'authenticated', 'authenticated',
  'e2e-bob@nudinadi.test',
  crypt('Passw0rd!Bob', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Bob E2E","username":"bob_e2e"}'::jsonb,
  false,
  '', '', '', ''
);

-- ── Auth identities (required for password login in newer GoTrue) ──────────
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  jsonb_build_object(
    'sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'email', 'e2e-alice@nudinadi.test',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  now(), now(), now()
);

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  jsonb_build_object(
    'sub', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'email', 'e2e-bob@nudinadi.test',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  now(), now(), now()
);

-- ── Make sure profiles exist with deterministic data ───────────────────────
-- (handle_new_user trigger should have created them; update for safety)
-- username_chosen: these fixtures stand in for established accounts. The
-- trigger defaults new rows to false, and migration 039's backfill only
-- covered rows that existed when it ran — so seeded users must opt in
-- explicitly or OnboardingGate drags every spec into /postavi-profil.
UPDATE profiles
SET username = 'alice_e2e',
    full_name = 'Alice E2E',
    location = 'Sarajevo',
    bio = 'E2E test user — Alice',
    username_chosen = true
WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

UPDATE profiles
SET username = 'bob_e2e',
    full_name = 'Bob E2E',
    location = 'Mostar',
    bio = 'E2E test user — Bob',
    username_chosen = true
WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- ── Test product owned by Alice (for product-detail + messaging tests) ─────
-- Uses an existing category from 007_categories_seed.sql
INSERT INTO products (
  id, seller_id, title, description, price, category_id, condition,
  images, status, location, views_count, favorites_count, tags
)
SELECT
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'E2E Test Proizvod — iPhone 13',
  'Ovo je test proizvod za automatizirane testove. Ne kupuj.',
  450.00,
  c.id,
  'used',
  ARRAY['https://picsum.photos/seed/e2e-test-product/800/600'],
  'active',
  'Sarajevo',
  0, 0,
  ARRAY['e2e', 'test', 'iphone']
FROM categories c
WHERE c.slug = 'mobilni-uredjaji-i-tableti-mobiteli'
   OR c.name ILIKE '%mobitel%'
   OR c.name ILIKE '%telefon%'
LIMIT 1
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  status = 'active';
