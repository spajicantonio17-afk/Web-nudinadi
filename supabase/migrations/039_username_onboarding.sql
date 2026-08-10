-- =============================================
-- NudiNađi - Migration 039: Username Onboarding
-- =============================================
-- 1. Marks whether the user picked their own username on /postavi-profil.
-- 2. Makes handle_new_user collision-safe — a duplicate username used to
--    abort the whole auth.users INSERT and break registration.

-- ── 1. username_chosen flag ──────────────────
-- Order matters: ADD COLUMN gives every existing row false, the UPDATE
-- then grandfathers them all in as already-chosen. DEFAULT false only
-- applies to rows inserted after this migration, i.e. new signups.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username_chosen BOOLEAN DEFAULT false NOT NULL;

UPDATE profiles SET username_chosen = true WHERE username_chosen = false;

-- ── 2. Collision-safe profile creation ───────
-- The previous version (migration 011) did a bare INSERT. profiles.username
-- is UNIQUE NOT NULL, so two signups whose email local-part matches
-- (ante@gmail.com / ante@yahoo.com → both "ante") raised unique_violation
-- inside an AFTER INSERT trigger, which rolled back the auth.users row.
--
-- BEGIN...EXCEPTION inside the LOOP opens a subtransaction per attempt, so
-- a caught conflict rolls back only that one INSERT. ON CONFLICT DO NOTHING
-- is NOT an option here: it would leave an auth user with no profile row.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  candidate     TEXT;
  attempt       INT := 0;
BEGIN
  -- Re-fired trigger (or a profile created out of band): nothing to do.
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- The client sanitises already, but OAuth metadata and future callers
  -- may not. Cap at 24 so the "_1234" suffix fits the 30-char budget.
  base_username := regexp_replace(
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'username', ''),
             'user_' || LEFT(NEW.id::text, 8)),
    '[^a-zA-Z0-9_]', '_', 'g'
  );
  base_username := LEFT(base_username, 24);

  IF LENGTH(base_username) < 3 THEN
    base_username := 'user_' || LEFT(NEW.id::text, 8);
  END IF;

  candidate := base_username;

  LOOP
    BEGIN
      INSERT INTO public.profiles (id, username, full_name, avatar_url, phone, username_chosen)
      VALUES (
        NEW.id,
        candidate,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        false
      );
      RETURN NEW;
    EXCEPTION WHEN unique_violation THEN
      attempt := attempt + 1;
      IF attempt > 5 THEN
        -- Give up on the pretty name; the bare uuid cannot collide.
        INSERT INTO public.profiles (id, username, full_name, avatar_url, phone, username_chosen)
        VALUES (
          NEW.id,
          LEFT('user_' || REPLACE(NEW.id::text, '-', ''), 30),
          COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
          COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
          COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
          false
        );
        RETURN NEW;
      END IF;
      candidate := base_username || '_' || FLOOR(RANDOM() * 10000)::TEXT;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
