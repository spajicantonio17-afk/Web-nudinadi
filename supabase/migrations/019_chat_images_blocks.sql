-- =============================================
-- Migration 019: Chat Images, Read Receipts & Block System
-- =============================================

-- ─── 1. Chat Images: Add image_url to messages ─────────────
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Make content nullable (image-only messages)
ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;

-- At least content OR image_url must be set
ALTER TABLE messages ADD CONSTRAINT messages_has_content
  CHECK (content IS NOT NULL OR image_url IS NOT NULL);

-- ─── 2. Read Receipts: Add read_at timestamp ───────────────
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- ─── 3. Block System: user_blocks table ─────────────────────
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON user_blocks(blocked_id);

-- RLS
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own blocks" ON user_blocks
  FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block" ON user_blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock" ON user_blocks
  FOR DELETE USING (auth.uid() = blocker_id);

-- ─── 4. Storage bucket for chat images ──────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to chat-images
CREATE POLICY "Auth users upload chat images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-images');

-- Allow public read of chat images
CREATE POLICY "Public read chat images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'chat-images');

-- Allow users to delete their own chat images
CREATE POLICY "Users delete own chat images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = 'chat');
