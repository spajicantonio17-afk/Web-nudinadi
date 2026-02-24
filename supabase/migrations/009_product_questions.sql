-- =============================================
-- NudiNađi - Migration 009: Product Questions (Public Q&A)
-- =============================================
-- Run this AFTER 008_add_attributes_and_views_rpc.sql

CREATE TABLE product_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  answered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_questions_product ON product_questions(product_id);
CREATE INDEX idx_questions_user ON product_questions(user_id);

-- RLS
ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can read questions
CREATE POLICY "questions_select_public"
  ON product_questions FOR SELECT
  USING (true);

-- Authenticated users can ask questions
CREATE POLICY "questions_insert_auth"
  ON product_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Product seller can answer (update answer field)
CREATE POLICY "questions_update_seller"
  ON product_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_questions.product_id
      AND p.seller_id = auth.uid()
    )
  );

-- Question author can delete their own question
CREATE POLICY "questions_delete_own"
  ON product_questions FOR DELETE
  USING (auth.uid() = user_id);
