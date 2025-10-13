-- Remove unused site_id column from items table
-- This column is redundant as site tracking is done via site_inventory table
ALTER TABLE items DROP COLUMN IF EXISTS site_id;