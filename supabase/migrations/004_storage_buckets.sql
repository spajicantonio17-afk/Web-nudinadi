-- =============================================
-- NudiNađi - Migration 004: Storage Buckets
-- =============================================
-- Run this AFTER 003_auto_profile_trigger.sql
-- Creates storage buckets for images/videos + access policies

-- ─── Create Buckets ───────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 5242880, -- 5MB max
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('profile-avatars', 'profile-avatars', true, 2097152, -- 2MB max
    ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('product-videos', 'product-videos', true, 52428800, -- 50MB max
    ARRAY['video/mp4', 'video/webm', 'video/quicktime']);

-- ─── product-images Policies ──────────────────────────

-- Anyone can view product images (public bucket)
CREATE POLICY "product_images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Authenticated users can upload product images
CREATE POLICY "product_images_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- Users can only update their own uploads (path starts with their user id)
CREATE POLICY "product_images_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only delete their own uploads
CREATE POLICY "product_images_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─── profile-avatars Policies ─────────────────────────

-- Anyone can view avatars (public bucket)
CREATE POLICY "avatars_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-avatars');

-- Authenticated users can upload their avatar
CREATE POLICY "avatars_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND auth.role() = 'authenticated'
  );

-- Users can only update their own avatar
CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only delete their own avatar
CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─── product-videos Policies ──────────────────────────

-- Anyone can view product videos (public bucket)
CREATE POLICY "product_videos_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-videos');

-- Authenticated users can upload videos
CREATE POLICY "product_videos_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-videos'
    AND auth.role() = 'authenticated'
  );

-- Users can only update their own videos
CREATE POLICY "product_videos_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only delete their own videos
CREATE POLICY "product_videos_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
