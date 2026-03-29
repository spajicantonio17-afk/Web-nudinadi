-- Migration 033: Email notification preferences
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_notif_messages  BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_notif_sold      BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_notif_follower  BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_notif_favorite  BOOLEAN DEFAULT true;