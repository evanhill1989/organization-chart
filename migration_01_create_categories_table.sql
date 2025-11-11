-- =====================================================
-- CATEGORIES TABLE MIGRATION
-- Organization Chart - Create Dynamic Categories
-- =====================================================

-- This migration creates the categories table to replace hardcoded TABS
-- Run this in the Supabase SQL Editor (Database > SQL Editor)
-- Note: RLS policies will be added later after basic functionality is working

-- =====================================================
-- STEP 1: Create categories table
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Default blue color (hex)
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique category names per user
  CONSTRAINT unique_user_category_name UNIQUE (user_id, name)
);

-- =====================================================
-- STEP 2: Create indexes for performance
-- =====================================================

-- Index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Index for ordering categories
CREATE INDEX IF NOT EXISTS idx_categories_user_order ON categories(user_id, order_index);

-- =====================================================
-- STEP 3: Create updated_at trigger
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before updates
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify the migration was successful:

-- 1. Check that categories table exists with correct columns
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'categories'
-- ORDER BY ordinal_position;

-- 2. Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'categories';

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- If something goes wrong, run this to rollback:
-- DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP INDEX IF EXISTS idx_categories_user_id;
-- DROP INDEX IF EXISTS idx_categories_user_order;
-- DROP TABLE IF EXISTS categories;

-- =====================================================
-- NOTES
-- =====================================================

/*
AFTER RUNNING THIS MIGRATION:

1. Run migration_02_add_category_id_to_org_nodes.sql to add category_id column
2. Run migration_03_seed_categories.sql to populate with default categories
3. Update frontend TypeScript types to include Category type
4. Update queries to use category_id instead of root_category

The categories table will store user-defined categories, replacing the
hardcoded TABS constant. Each user can have their own set of categories.

Color format: Hex color code (e.g., '#3B82F6' for blue, '#EF4444' for red)
Order index: Lower numbers appear first in navigation

Note: RLS policies are not enabled yet. They will be added in a future
migration after basic functionality is verified to be working.
*/
