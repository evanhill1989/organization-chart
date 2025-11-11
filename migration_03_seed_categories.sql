-- =====================================================
-- SEED CATEGORIES & POPULATE CATEGORY_ID
-- Organization Chart - Data Migration
-- =====================================================

-- This migration seeds the categories table with default categories
-- and populates category_id in org_nodes based on root_category
-- Run AFTER migration_01 and migration_02

-- =====================================================
-- STEP 1: Seed default categories for all users
-- =====================================================

-- This creates the 7 default categories (matching TABS constant)
-- for every user that has org_nodes

DO $$
DECLARE
  user_record RECORD;
  category_names TEXT[] := ARRAY['Household', 'Finances', 'Cleo', 'Job', 'Social', 'Personal', 'Orphans'];
  category_name TEXT;
  category_index INT := 0;
BEGIN
  -- Loop through all users who have org_nodes
  FOR user_record IN
    SELECT DISTINCT user_id FROM org_nodes WHERE user_id IS NOT NULL
  LOOP
    -- For each user, create the 7 default categories
    category_index := 0;
    FOREACH category_name IN ARRAY category_names
    LOOP
      -- Insert category if it doesn't already exist for this user
      INSERT INTO categories (user_id, name, order_index, color, description)
      VALUES (
        user_record.user_id,
        category_name,
        category_index,
        CASE category_name
          WHEN 'Household' THEN '#10B981' -- Green
          WHEN 'Finances' THEN '#3B82F6'  -- Blue
          WHEN 'Cleo' THEN '#F59E0B'      -- Amber
          WHEN 'Job' THEN '#8B5CF6'       -- Purple
          WHEN 'Social' THEN '#EC4899'    -- Pink
          WHEN 'Personal' THEN '#06B6D4'  -- Cyan
          WHEN 'Orphans' THEN '#6B7280'   -- Gray
          ELSE '#3B82F6'                   -- Default blue
        END,
        CASE category_name
          WHEN 'Household' THEN 'Home maintenance, chores, and household tasks'
          WHEN 'Finances' THEN 'Financial planning, budgeting, and money management'
          WHEN 'Cleo' THEN 'Tasks related to Cleo'
          WHEN 'Job' THEN 'Work-related tasks and career development'
          WHEN 'Social' THEN 'Social events, relationships, and networking'
          WHEN 'Personal' THEN 'Personal goals, hobbies, and self-improvement'
          WHEN 'Orphans' THEN 'Uncategorized tasks that need organization'
          ELSE NULL
        END
      )
      ON CONFLICT (user_id, name) DO NOTHING; -- Skip if already exists

      category_index := category_index + 1;
    END LOOP;

    RAISE NOTICE 'Created default categories for user: %', user_record.user_id;
  END LOOP;
END $$;

-- =====================================================
-- STEP 2: Populate category_id from root_category
-- =====================================================

-- Update org_nodes.category_id based on root_category value
-- This links existing nodes to their corresponding category

DO $$
DECLARE
  updated_count INT;
BEGIN
  -- Update all org_nodes to link to the matching category
  UPDATE org_nodes
  SET category_id = c.id
  FROM categories c
  WHERE org_nodes.user_id = c.user_id
    AND org_nodes.root_category = c.name
    AND org_nodes.category_id IS NULL; -- Only update if not already set

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % org_nodes with category_id', updated_count;
END $$;

-- =====================================================
-- STEP 3: Verify data integrity
-- =====================================================

-- Check for org_nodes without category_id
DO $$
DECLARE
  orphaned_count INT;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM org_nodes
  WHERE category_id IS NULL AND root_category IS NOT NULL;

  IF orphaned_count > 0 THEN
    RAISE WARNING '% org_nodes still have NULL category_id!', orphaned_count;
    RAISE WARNING 'Run this query to investigate: SELECT id, name, root_category, user_id FROM org_nodes WHERE category_id IS NULL LIMIT 20;';
  ELSE
    RAISE NOTICE 'All org_nodes successfully linked to categories!';
  END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify the migration was successful:

-- 1. Count categories per user
-- SELECT user_id, COUNT(*) as category_count
-- FROM categories
-- GROUP BY user_id
-- ORDER BY user_id;

-- 2. List all categories with their colors (replace 'YOUR_USER_ID' with actual UUID)
-- SELECT name, color, order_index, description
-- FROM categories
-- WHERE user_id = 'YOUR_USER_ID'
-- ORDER BY order_index;

-- 3. Verify org_nodes are linked to categories (replace 'YOUR_USER_ID' with actual UUID)
-- SELECT
--   c.name as category_name,
--   COUNT(o.id) as node_count
-- FROM categories c
-- LEFT JOIN org_nodes o ON o.category_id = c.id
-- WHERE c.user_id = 'YOUR_USER_ID'
-- GROUP BY c.name, c.order_index
-- ORDER BY c.order_index;

-- 4. Find any orphaned org_nodes (should be 0)
-- SELECT id, name, root_category, user_id
-- FROM org_nodes
-- WHERE category_id IS NULL
-- LIMIT 20;

-- 5. Compare root_category vs category_id (should match, replace 'YOUR_USER_ID' with actual UUID)
-- SELECT
--   o.id,
--   o.name,
--   o.root_category,
--   c.name as category_name
-- FROM org_nodes o
-- LEFT JOIN categories c ON o.category_id = c.id
-- WHERE o.user_id = 'YOUR_USER_ID'
-- LIMIT 20;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- If something goes wrong, run this to rollback:
-- UPDATE org_nodes SET category_id = NULL;
-- DELETE FROM categories; -- This will cascade to org_nodes if foreign key exists

-- =====================================================
-- MANUAL FIXES
-- =====================================================

-- If you have orphaned org_nodes after migration, fix them manually:

-- Option 1: Link to "Orphans" category
-- UPDATE org_nodes
-- SET category_id = (
--   SELECT c.id FROM categories c
--   WHERE c.user_id = org_nodes.user_id AND c.name = 'Orphans'
-- )
-- WHERE category_id IS NULL;

-- Option 2: Delete orphaned nodes (BE CAREFUL!)
-- DELETE FROM org_nodes WHERE category_id IS NULL;

-- Option 3: Create missing categories
-- If a user has nodes with root_category values not in the default list,
-- create custom categories for them:
-- INSERT INTO categories (user_id, name, order_index)
-- SELECT DISTINCT user_id, root_category, 999
-- FROM org_nodes
-- WHERE category_id IS NULL AND root_category IS NOT NULL;

-- Then re-run STEP 2 to link them

-- =====================================================
-- NOTES
-- =====================================================

/*
AFTER RUNNING THIS MIGRATION:

1. Verify results using verification queries above
2. All users should have 7 default categories
3. All org_nodes should have category_id populated
4. No orphaned records (category_id IS NULL)

If you find issues:
- Check that migration_01 and migration_02 ran successfully
- Verify users exist in auth.users table
- Check for typos in root_category values (case-sensitive!)
- Get your user_id by running: SELECT id, email FROM auth.users;

Next steps:
1. Update TypeScript types to include Category
2. Update queries to use category_id (optional: keep root_category for now)
3. Test frontend with new category structure
4. Eventually run migration_04_remove_root_category.sql to complete transition

DEFAULT CATEGORY COLORS:
- Household: Green (#10B981)
- Finances: Blue (#3B82F6)
- Cleo: Amber (#F59E0B)
- Job: Purple (#8B5CF6)
- Social: Pink (#EC4899)
- Personal: Cyan (#06B6D4)
- Orphans: Gray (#6B7280)
*/
