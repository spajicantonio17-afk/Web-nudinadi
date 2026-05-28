-- ── Migration: Add locale to profiles ──────────────────────────
-- Stores the user's preferred UI language per account.
-- Synced from localStorage on login, saved on language change.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'bs'
  CHECK (locale IN ('bs', 'en'));
