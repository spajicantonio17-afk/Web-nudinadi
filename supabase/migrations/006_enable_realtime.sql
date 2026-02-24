-- =============================================
-- NudiNađi - Migration 006: Enable Realtime
-- =============================================
-- Run this AFTER 005_functions_and_triggers.sql
-- Enables Supabase Realtime for live updates

-- Enable realtime for messages (live chat)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for products (live feed updates)
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- Enable realtime for conversations (new conversation notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Enable realtime for favorites (live favorite count)
ALTER PUBLICATION supabase_realtime ADD TABLE favorites;
