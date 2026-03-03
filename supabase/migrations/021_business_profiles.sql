-- ===========================================
-- Migration 021: Business Profiles & Team Management
-- Features: Company profile fields, team member table
-- ===========================================

-- ─── 1. Business Profile Fields on Profiles ──────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_logo TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_image TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_hours JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_category TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;

-- ─── 2. Team Members Table ───────────────────────────────

CREATE TABLE IF NOT EXISTS business_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(business_user_id, member_user_id)
);

ALTER TABLE business_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_read" ON business_team_members FOR SELECT
  USING (business_user_id = auth.uid() OR member_user_id = auth.uid());

CREATE POLICY "team_manage" ON business_team_members FOR ALL
  USING (business_user_id = auth.uid());
