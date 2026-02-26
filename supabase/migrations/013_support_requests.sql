-- ============================================================
-- Migration 013: Support Requests (Kontakt-Formular)
-- ============================================================

CREATE TABLE IF NOT EXISTS support_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('bug', 'account', 'listing', 'payment', 'suggestion', 'other')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (authenticated or anon) can submit
CREATE POLICY "Anyone can submit support requests"
  ON support_requests FOR INSERT
  WITH CHECK (true);

-- Users can view their own requests
CREATE POLICY "Users can view own support requests"
  ON support_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all support requests"
  ON support_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admins can update (change status, add notes)
CREATE POLICY "Admins can update support requests"
  ON support_requests FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Indexes for admin dashboard queries
CREATE INDEX idx_support_requests_status ON support_requests(status);
CREATE INDEX idx_support_requests_created ON support_requests(created_at DESC);
CREATE INDEX idx_support_requests_user ON support_requests(user_id);
