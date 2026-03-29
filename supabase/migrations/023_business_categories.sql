-- Migration 023: Add business_categories array field
-- Replaces single business_category text with multi-select array

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_categories TEXT[];

-- Migrate existing data: wrap old single value into array
UPDATE profiles
SET business_categories = ARRAY[business_category]
WHERE business_category IS NOT NULL
  AND business_categories IS NULL;
