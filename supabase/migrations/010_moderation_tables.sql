-- ===========================================
-- NudiNađi - Moderation System Tables
-- ===========================================
-- Creates tables for moderation reports, actions, warnings, bans, and AI logs.
-- Based on types defined in src/lib/database.types.ts

-- ─── Enums ──────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE moderation_status AS ENUM ('pending', 'reviewing', 'approved', 'rejected', 'escalated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE report_reason AS ENUM ('spam', 'scam', 'prohibited_content', 'duplicate', 'inappropriate', 'fake_listing', 'personal_info', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE moderation_action_type AS ENUM ('approve', 'reject', 'warn', 'ban', 'unban', 'escalate', 'dismiss');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Moderation Reports ─────────────────────────────

CREATE TABLE IF NOT EXISTS moderation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason report_reason NOT NULL,
  description TEXT,
  ai_moderation_result JSONB,
  ai_score NUMERIC,
  status moderation_status NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  assigned_admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Moderation Actions (Audit Log) ─────────────────

CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES moderation_reports(id) ON DELETE SET NULL,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type moderation_action_type NOT NULL,
  target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── User Warnings ──────────────────────────────────

CREATE TABLE IF NOT EXISTS user_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_id UUID REFERENCES moderation_reports(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  severity INTEGER NOT NULL DEFAULT 1 CHECK (severity >= 1 AND severity <= 5),
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── User Bans ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  banned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  unbanned_at TIMESTAMPTZ,
  unbanned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── AI Moderation Logs ─────────────────────────────

CREATE TABLE IF NOT EXISTS ai_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  input_data JSONB NOT NULL DEFAULT '{}',
  result_data JSONB NOT NULL DEFAULT '{}',
  score NUMERIC,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON moderation_reports(status);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_priority ON moderation_reports(priority DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_created ON moderation_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_product ON moderation_reports(product_id);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_user ON moderation_reports(reported_user_id);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_report ON moderation_actions(report_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_admin ON moderation_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_created ON moderation_actions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_warnings_user ON user_warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_warnings_created ON user_warnings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_bans_user ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_active ON user_bans(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_ai_logs_flagged ON ai_moderation_logs(is_flagged) WHERE is_flagged = true;
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_moderation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_product ON ai_moderation_logs(product_id);

-- ─── RLS Policies ───────────────────────────────────

ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_moderation_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only access for all moderation tables
-- (These tables are accessed via service role key in API routes,
--  so RLS policies are for direct DB access protection)

CREATE POLICY "Admins can view all reports"
  ON moderation_reports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Service role can insert reports"
  ON moderation_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update reports"
  ON moderation_reports FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can view actions"
  ON moderation_actions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Service role can insert actions"
  ON moderation_actions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view warnings"
  ON user_warnings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    OR user_id = auth.uid()
  );

CREATE POLICY "Service role can insert warnings"
  ON user_warnings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view bans"
  ON user_bans FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    OR user_id = auth.uid()
  );

CREATE POLICY "Service role can manage bans"
  ON user_bans FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view AI logs"
  ON ai_moderation_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Service role can insert AI logs"
  ON ai_moderation_logs FOR INSERT
  WITH CHECK (true);

-- ─── Auto-update trigger for moderation_reports ─────

CREATE TRIGGER set_updated_at_moderation_reports
  BEFORE UPDATE ON moderation_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
