-- =====================================================
-- ADD CATEGORY ARCHIVING (SOFT DELETE)
-- Organization Chart - Phase 5 Advanced Features
-- =====================================================

-- This migration adds soft delete functionality to categories
-- Archived categories are hidden from main view but can be restored

-- =====================================================
-- STEP 1: Add archived column to categories table
-- =====================================================

ALTER TABLE categories ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Add archived_at timestamp for tracking when category was archived
ALTER TABLE categories ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- =====================================================
-- STEP 2: Create index for filtering archived categories
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_categories_archived ON categories(user_id, archived);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify the migration was successful:

-- 1. Verify columns exist
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'categories'
-- AND column_name IN ('archived', 'archived_at')
-- ORDER BY ordinal_position;

-- 2. Count active vs archived categories per user
-- SELECT
--   user_id,
--   COUNT(*) FILTER (WHERE archived = FALSE) as active_count,
--   COUNT(*) FILTER (WHERE archived = TRUE) as archived_count
-- FROM categories
-- GROUP BY user_id;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to archive a category (soft delete)
-- Usage: SELECT archive_category('category-uuid-here');
CREATE OR REPLACE FUNCTION archive_category(category_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE categories
  SET archived = TRUE, archived_at = NOW()
  WHERE id = category_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to unarchive a category (restore)
-- Usage: SELECT unarchive_category('category-uuid-here');
CREATE OR REPLACE FUNCTION unarchive_category(category_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE categories
  SET archived = FALSE, archived_at = NULL
  WHERE id = category_uuid;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- NOTES
-- =====================================================

/*
AFTER RUNNING THIS MIGRATION:

1. Categories can be archived (soft deleted) instead of permanently deleted
2. Archived categories don't appear in normal queries
3. Archived categories can be restored
4. org_nodes remain linked to archived categories (not cascaded)

USAGE IN APPLICATION:

// Fetch only active categories
const { data } = await supabase
  .from('categories')
  .select('*')
  .eq('user_id', userId)
  .eq('archived', false)  // ✅ Filter out archived
  .order('order_index');

// Fetch archived categories
const { data } = await supabase
  .from('categories')
  .select('*')
  .eq('user_id', userId)
  .eq('archived', true)  // ✅ Only archived
  .order('archived_at', { ascending: false });

// Archive a category
await supabase
  .from('categories')
  .update({ archived: true, archived_at: new Date().toISOString() })
  .eq('id', categoryId);

// Unarchive a category
await supabase
  .from('categories')
  .update({ archived: false, archived_at: null })
  .eq('id', categoryId);

BENEFITS:
- No data loss
- Can undo accidental deletions
- Keep historical data
- Reduce clutter without permanent deletion
*/
