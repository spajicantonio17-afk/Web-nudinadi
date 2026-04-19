-- =============================================
-- NudiNađi - Migration 030: Fix Verification XP Race Condition
-- =============================================
-- Prevents multiple verification activities via partial unique index
-- Step 1: Clean up duplicate verification activities (keep only the first one per user)

DELETE FROM user_activities ua
WHERE activity_type = 'verification'
  AND (ua.user_id, ua.created_at) NOT IN (
    SELECT user_id, MIN(created_at)
    FROM user_activities
    WHERE activity_type = 'verification'
    GROUP BY user_id
  );

-- Step 2: Add partial unique index to prevent race-condition duplicate verification XP
-- Only applies to verification activities (not login, upload, etc)
CREATE UNIQUE INDEX idx_unique_verification_per_user
ON user_activities(user_id)
WHERE activity_type = 'verification';

-- Step 3: Recalculate XP for all users (trigger will recalculate levels)
WITH corrected_xp AS (
  SELECT
    p.id,
    COALESCE(SUM(ua.xp_earned), 0)::INTEGER as total_xp
  FROM profiles p
  LEFT JOIN user_activities ua ON ua.user_id = p.id
  GROUP BY p.id
)
UPDATE profiles p
SET
  xp = corrected_xp.total_xp,
  level = calculate_user_level(corrected_xp.total_xp)
FROM corrected_xp
WHERE p.id = corrected_xp.id
  AND p.xp != corrected_xp.total_xp;
