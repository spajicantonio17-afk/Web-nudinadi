-- =============================================
-- NudiNađi - Migration 011: Phone + Email Verified
-- =============================================

-- Phone number (optional, user can add in profile)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Tracks if the user actually clicked the email verification link
-- (auto-confirm sets auth.users.email_confirmed_at for login,
--  but this tracks real verification for the profile badge)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false NOT NULL;

-- Update the handle_new_user trigger to include phone from metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::text, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
