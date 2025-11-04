-- =====================================================
-- SUPABASE AUTH MIGRATION
-- Organization Chart - Add User Authentication
-- =====================================================

-- This migration adds user authentication to the org_nodes table
-- Run this in the Supabase SQL Editor (Database > SQL Editor)

-- =====================================================
-- STEP 1: Add user_id column to org_nodes table
-- =====================================================

-- Add user_id column (nullable initially for backfilling)
ALTER TABLE org_nodes
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_org_nodes_user_id ON org_nodes(user_id);

-- =====================================================
-- STEP 2: Create your first user account
-- =====================================================

-- MANUAL STEP: Before proceeding, create your user account:
-- Option A: Via Supabase Dashboard
--   1. Go to Authentication > Users
--   2. Click "Add User"
--   3. Enter your email and password
--   4. Copy the user ID (UUID) that gets generated
--
-- Option B: Via signup page (after frontend is built)
--   1. Use the signup form
--   2. Query to get your user ID: SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- =====================================================
-- STEP 3: Backfill existing data with your user_id
-- =====================================================

-- REPLACE 'YOUR_USER_ID_HERE' with the actual UUID from Step 2
-- Example: '550e8400-e29b-41d4-a716-446655440000'

-- To get your user ID, run this first:
-- SELECT id, email FROM auth.users;

-- Then update all existing org_nodes with your user_id:
-- UPDATE org_nodes
-- SET user_id = 'YOUR_USER_ID_HERE'
-- WHERE user_id IS NULL;

-- Verify all rows have been updated:
-- SELECT COUNT(*) as total_rows,
--        COUNT(user_id) as rows_with_user_id
-- FROM org_nodes;
-- (Both counts should match)

-- =====================================================
-- STEP 4: Make user_id required (NOT NULL)
-- =====================================================

-- After backfilling, make user_id required for all future rows
-- (Uncomment after backfilling is complete)
-- ALTER TABLE org_nodes
-- ALTER COLUMN user_id SET NOT NULL;

-- =====================================================
-- STEP 5: Enable Row Level Security (RLS)
-- =====================================================

-- Enable RLS on org_nodes table
ALTER TABLE org_nodes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: Create RLS Policies
-- =====================================================

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view their own org_nodes" ON org_nodes;
DROP POLICY IF EXISTS "Users can insert their own org_nodes" ON org_nodes;
DROP POLICY IF EXISTS "Users can update their own org_nodes" ON org_nodes;
DROP POLICY IF EXISTS "Users can delete their own org_nodes" ON org_nodes;

-- Policy 1: SELECT - Users can only see their own nodes
CREATE POLICY "Users can view their own org_nodes"
ON org_nodes
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: INSERT - Users can only create nodes with their own user_id
CREATE POLICY "Users can insert their own org_nodes"
ON org_nodes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: UPDATE - Users can only update their own nodes
CREATE POLICY "Users can update their own org_nodes"
ON org_nodes
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: DELETE - Users can only delete their own nodes
CREATE POLICY "Users can delete their own org_nodes"
ON org_nodes
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify the migration was successful:

-- 1. Check that user_id column exists
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'org_nodes' AND column_name = 'user_id';

-- 2. Check that RLS is enabled
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE tablename = 'org_nodes';

-- 3. Check that policies exist
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'org_nodes';

-- 4. Count your nodes (should match pre-migration count)
-- SELECT COUNT(*) FROM org_nodes WHERE user_id = 'YOUR_USER_ID_HERE';

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- If something goes wrong, run this to rollback:
-- DROP POLICY IF EXISTS "Users can view their own org_nodes" ON org_nodes;
-- DROP POLICY IF EXISTS "Users can insert their own org_nodes" ON org_nodes;
-- DROP POLICY IF EXISTS "Users can update their own org_nodes" ON org_nodes;
-- DROP POLICY IF EXISTS "Users can delete their own org_nodes" ON org_nodes;
-- ALTER TABLE org_nodes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE org_nodes DROP COLUMN IF EXISTS user_id;
-- DROP INDEX IF EXISTS idx_org_nodes_user_id;

-- =====================================================
-- STEP-BY-STEP EXECUTION GUIDE
-- =====================================================

/*

EXECUTE IN THIS ORDER:

1. Run STEP 1 (Add user_id column and index)

2. Create your user account manually:
   - Go to Supabase Dashboard > Authentication > Users > Add User
   - OR wait and use the signup form after frontend is built
   - Copy your user ID (UUID)

3. Run this query to get your user ID:
   SELECT id, email FROM auth.users;

4. Update STEP 3 with your actual user ID and run the UPDATE query:
   UPDATE org_nodes
   SET user_id = 'your-actual-uuid-here'
   WHERE user_id IS NULL;

5. Verify all rows updated:
   SELECT COUNT(*) as total_rows,
          COUNT(user_id) as rows_with_user_id
   FROM org_nodes;

6. Uncomment and run the ALTER COLUMN statement in STEP 4

7. Run STEP 5 (Enable RLS)

8. Run STEP 6 (Create all policies)

9. Run verification queries to confirm everything works

*/
