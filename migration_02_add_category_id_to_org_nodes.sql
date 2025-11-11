-- =====================================================
-- ADD CATEGORY_ID TO ORG_NODES MIGRATION
-- Organization Chart - Link nodes to dynamic categories
-- =====================================================

-- This migration adds category_id to org_nodes table
-- Run AFTER migration_01_create_categories_table.sql

-- =====================================================
-- STEP 1: Add category_id column (nullable for now)
-- =====================================================

-- Add category_id column (nullable initially for backfilling)
ALTER TABLE org_nodes
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- Create index for faster queries by category_id
CREATE INDEX IF NOT EXISTS idx_org_nodes_category_id ON org_nodes(category_id);

-- Create composite index for user + category queries
CREATE INDEX IF NOT EXISTS idx_org_nodes_user_category ON org_nodes(user_id, category_id);

-- =====================================================
-- STEP 2: Keep root_category for backward compatibility
-- =====================================================

-- NOTE: Do NOT drop root_category column yet
-- We'll keep both columns during the transition period:
-- - root_category: Legacy string-based category (Household, Finances, etc.)
-- - category_id: New UUID reference to categories table
--
-- After all code is updated to use category_id, we'll drop root_category
-- in a future migration (migration_04_remove_root_category.sql)

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify the migration was successful:

-- 1. Check that category_id column exists
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'org_nodes' AND column_name = 'category_id';

-- 2. Check foreign key constraint exists
-- SELECT
--   tc.constraint_name,
--   tc.table_name,
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_name = 'org_nodes'
--   AND kcu.column_name = 'category_id';

-- 3. Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'org_nodes' AND indexname LIKE '%category%';

-- 4. Verify both columns exist (for transition period)
-- SELECT column_name
-- FROM information_schema.columns
-- WHERE table_name = 'org_nodes'
--   AND column_name IN ('root_category', 'category_id');

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- If something goes wrong, run this to rollback:
-- DROP INDEX IF EXISTS idx_org_nodes_category_id;
-- DROP INDEX IF EXISTS idx_org_nodes_user_category;
-- ALTER TABLE org_nodes DROP COLUMN IF EXISTS category_id;

-- =====================================================
-- NOTES
-- =====================================================

/*
AFTER RUNNING THIS MIGRATION:

1. Run migration_03_seed_categories.sql to:
   - Create default categories for all existing users
   - Populate category_id from root_category values

2. Verify data integrity:
   - All org_nodes should have matching category_id
   - No orphaned records

3. Update application code:
   - TypeScript types to include category_id
   - Queries to filter by category_id instead of root_category
   - Maintain backward compatibility initially

4. Future cleanup:
   - After all code migrated, run migration_04_remove_root_category.sql
   - Make category_id NOT NULL
   - Drop root_category column

TRANSITION STRATEGY:
- Phase 2 (now): Add category_id, keep root_category
- Phase 3-4: Update all code to use category_id
- Phase 5: Remove root_category column

This allows for a gradual migration without breaking existing functionality.
*/
