-- =====================================================
-- ADD USER_ID TO ORG_NODES (Simplified - No RLS Yet)
-- Organization Chart - User Column Setup
-- =====================================================

-- This migration adds user_id column and backfills existing data
-- RLS will be added later once auth is fully working
-- Run this in the Supabase SQL Editor (Database > SQL Editor)

-- =====================================================
-- STEP 1: Add user_id column
-- =====================================================

ALTER TABLE org_nodes
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_org_nodes_user_id ON org_nodes(user_id);

-- =====================================================
-- STEP 2: Create your user account
-- =====================================================

-- Go to: Authentication > Users > Add User
-- Enter your email and password
-- Copy the UUID that gets generated

-- =====================================================
-- STEP 3: Get your user ID
-- =====================================================

SELECT id, email FROM auth.users;

-- =====================================================
-- STEP 4: Backfill existing data with your user_id
-- =====================================================

-- REPLACE 'YOUR_USER_ID_HERE' with your actual UUID from Step 3
-- Example: UPDATE org_nodes SET user_id = '550e8400-e29b-41d4-a716-446655440000' WHERE user_id IS NULL;

UPDATE org_nodes
SET user_id = 'YOUR_USER_ID_HERE'
WHERE user_id IS NULL;

-- =====================================================
-- STEP 5: Verify backfill worked
-- =====================================================

SELECT COUNT(*) as total_rows,
       COUNT(user_id) as rows_with_user_id
FROM org_nodes;

-- Both numbers should match!

-- =====================================================
-- STEP 6: Make user_id required for future rows
-- =====================================================

ALTER TABLE org_nodes
ALTER COLUMN user_id SET NOT NULL;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'org_nodes' AND column_name = 'user_id';

-- Count your nodes
SELECT COUNT(*) FROM org_nodes WHERE user_id = 'YOUR_USER_ID_HERE';

-- =====================================================
-- DONE!
-- =====================================================

-- RLS will be added later from migration_add_auth.sql (Step 5-6)
-- once the auth flow is fully working
