-- =====================================================
-- REMOVE LEGACY ROOT_CATEGORY COLUMN
-- Organization Chart - Phase 5 Cleanup
-- =====================================================

-- ⚠️ IMPORTANT: Only run this migration AFTER confirming:
-- 1. All org_nodes have category_id populated
-- 2. migration_03 completed successfully
-- 3. Application is working correctly with category_id
-- 4. You have a database backup

-- This migration permanently removes the root_category column
-- and completes the transition to dynamic categories

-- =====================================================
-- STEP 1: Verify Data Integrity Before Deletion
-- =====================================================

DO $$
DECLARE
  orphaned_count INT;
  total_count INT;
BEGIN
  -- Count nodes without category_id
  SELECT COUNT(*) INTO orphaned_count
  FROM org_nodes
  WHERE category_id IS NULL;

  -- Count total nodes
  SELECT COUNT(*) INTO total_count
  FROM org_nodes;

  RAISE NOTICE 'Total org_nodes: %', total_count;
  RAISE NOTICE 'Nodes without category_id: %', orphaned_count;

  IF orphaned_count > 0 THEN
    RAISE EXCEPTION 'MIGRATION ABORTED: % org_nodes still have NULL category_id. Run migration_03 first or fix orphaned nodes.', orphaned_count;
  ELSE
    RAISE NOTICE '✅ All org_nodes have category_id. Safe to proceed.';
  END IF;
END $$;

-- =====================================================
-- STEP 2: Remove root_category Column
-- =====================================================

DO $$
BEGIN
  -- Drop the root_category column from org_nodes table
  ALTER TABLE org_nodes DROP COLUMN IF EXISTS root_category;

  RAISE NOTICE '✅ Removed root_category column from org_nodes table';
END $$;

-- =====================================================
-- STEP 3: Remove tab_name Column (also legacy)
-- =====================================================

DO $$
BEGIN
  -- Drop the tab_name column (also used for backward compatibility)
  ALTER TABLE org_nodes DROP COLUMN IF EXISTS tab_name;

  RAISE NOTICE '✅ Removed tab_name column from org_nodes table';
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify the migration was successful:

-- 1. Verify columns are removed
-- SELECT column_name
-- FROM information_schema.columns
-- WHERE table_name = 'org_nodes'
-- ORDER BY ordinal_position;

-- Expected: root_category and tab_name should NOT appear in the list

-- 2. Verify all nodes still have category_id
-- SELECT COUNT(*) as nodes_with_category_id
-- FROM org_nodes
-- WHERE category_id IS NOT NULL;

-- Expected: Should equal total count of org_nodes

-- 3. Verify nodes are properly linked to categories
-- SELECT
--   c.name as category_name,
--   COUNT(o.id) as node_count
-- FROM categories c
-- LEFT JOIN org_nodes o ON o.category_id = c.id
-- WHERE c.user_id = 'YOUR_USER_ID' -- Replace with actual user_id
-- GROUP BY c.name, c.order_index
-- ORDER BY c.order_index;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- ⚠️ WARNING: This rollback cannot restore deleted data!
-- You can only add the columns back (they will be empty):

-- ALTER TABLE org_nodes ADD COLUMN root_category VARCHAR(255);
-- ALTER TABLE org_nodes ADD COLUMN tab_name VARCHAR(255);

-- To repopulate from category_id:
-- UPDATE org_nodes
-- SET root_category = c.name, tab_name = c.name
-- FROM categories c
-- WHERE org_nodes.category_id = c.id;

-- =====================================================
-- NOTES
-- =====================================================

/*
AFTER RUNNING THIS MIGRATION:

1. ✅ org_nodes table only uses category_id (UUID reference)
2. ✅ No more hardcoded category names in database
3. ✅ Fully dynamic category system
4. ✅ Users can rename categories without data migration

CLEANUP CHECKLIST:
- [ ] Update TypeScript types to remove root_category and tab_name
- [ ] Remove any code that references root_category or tab_name
- [ ] Delete TABS constant file (app/lib/consts/TABS.ts)
- [ ] Update CLAUDE.md documentation

BENEFITS:
- Simpler data model
- No naming constraints
- Fully user-defined categories
- Easier to maintain
*/
