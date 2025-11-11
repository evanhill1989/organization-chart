# Phase 2 Migration Instructions

## Overview

Phase 2 adds dynamic categories to the org-chart application. Categories are now stored in the database instead of being hardcoded, allowing users to create, edit, and delete their own categories.

**Note:** RLS (Row Level Security) policies are NOT included in this phase. We're keeping things simple and focusing on getting basic functionality working first. RLS will be added in a future phase after everything is verified to work correctly.

## Migration Files

Run these migrations **in order** in the Supabase SQL Editor:

1. **migration_01_create_categories_table.sql**
   - Creates the `categories` table
   - Creates indexes for performance
   - Adds automatic `updated_at` timestamp trigger

2. **migration_02_add_category_id_to_org_nodes.sql**
   - Adds `category_id` column to `org_nodes` table
   - Creates foreign key constraint to `categories` table
   - Keeps `root_category` for backward compatibility
   - Adds indexes for efficient queries

3. **migration_03_seed_categories.sql**
   - Seeds default categories for all existing users
   - Populates `category_id` from `root_category` values
   - Verifies data integrity

## How to Run Migrations

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **SQL Editor**
3. Click **New query**

### Step 2: Run Migration 01

1. Copy the entire contents of `migration_01_create_categories_table.sql`
2. Paste into SQL Editor
3. Click **Run** (or press Ctrl+Enter)
4. Verify success: You should see "Success. No rows returned"

### Step 3: Run Migration 02

1. Copy the entire contents of `migration_02_add_category_id_to_org_nodes.sql`
2. Paste into SQL Editor
3. Click **Run**
4. Verify success

### Step 4: Run Migration 03

1. Copy the entire contents of `migration_03_seed_categories.sql`
2. Paste into SQL Editor
3. Click **Run**
4. Check the **Results** tab for success messages:
   - "Created default categories for user: [user_id]"
   - "Updated X org_nodes with category_id"
   - "All org_nodes successfully linked to categories!"

## Verification Queries

After running all migrations, verify the results:

### 1. Check categories table exists

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'categories'
ORDER BY ordinal_position;
```

Expected: 8 columns (id, user_id, name, description, color, order_index, created_at, updated_at)

### 2. Get your user ID

```sql
SELECT id, email FROM auth.users;
```

Copy your user_id (UUID) for the next queries.

### 3. Count your categories (replace 'YOUR_USER_ID' with actual UUID)

```sql
SELECT name, color, order_index
FROM categories
WHERE user_id = 'YOUR_USER_ID'
ORDER BY order_index;
```

Expected: 7 default categories (Household, Finances, Cleo, Job, Social, Personal, Orphans)

### 4. Verify org_nodes linkage (replace 'YOUR_USER_ID' with actual UUID)

```sql
SELECT
  c.name as category_name,
  COUNT(o.id) as node_count
FROM categories c
LEFT JOIN org_nodes o ON o.category_id = c.id
WHERE c.user_id = 'YOUR_USER_ID'
GROUP BY c.name, c.order_index
ORDER BY c.order_index;
```

Expected: All categories with their node counts, matching your data

### 5. Check for orphaned nodes (should be 0)

```sql
SELECT COUNT(*)
FROM org_nodes
WHERE category_id IS NULL AND root_category IS NOT NULL;
```

Expected: 0 (all nodes should have category_id)

## Troubleshooting

### Issue: "relation 'categories' already exists"

**Solution:** The migration has already been run. You can safely skip migration_01.

### Issue: "column 'category_id' already exists"

**Solution:** Migration_02 has already been run. Skip it.

### Issue: Orphaned nodes (category_id IS NULL)

**Solution:** Run this to link them to "Orphans" category:

```sql
UPDATE org_nodes ON
SET category_id = (
  SELECT c.id FROM categories c
  WHERE c.user_id = ON.user_id AND c.name = 'Orphans'
)
WHERE category_id IS NULL;
```

### Issue: Missing categories for new user

**Solution:** If you created a new user after running migrations, manually create categories:

```sql
-- Replace 'YOUR_USER_ID' with actual UUID from auth.users
INSERT INTO categories (user_id, name, order_index, color, description)
VALUES
  ('YOUR_USER_ID', 'Household', 0, '#10B981', 'Home maintenance and household tasks'),
  ('YOUR_USER_ID', 'Finances', 1, '#3B82F6', 'Financial planning and budgeting'),
  ('YOUR_USER_ID', 'Cleo', 2, '#F59E0B', 'Tasks related to Cleo'),
  ('YOUR_USER_ID', 'Job', 3, '#8B5CF6', 'Work-related tasks'),
  ('YOUR_USER_ID', 'Social', 4, '#EC4899', 'Social events and relationships'),
  ('YOUR_USER_ID', 'Personal', 5, '#06B6D4', 'Personal goals and hobbies'),
  ('YOUR_USER_ID', 'Orphans', 6, '#6B7280', 'Uncategorized tasks');
```

## What Changed in the Database

### New Table: `categories`

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_category_name UNIQUE (user_id, name)
);
```

### Updated Table: `org_nodes`

Added column:
- `category_id UUID REFERENCES categories(id) ON DELETE CASCADE`

Kept for backward compatibility:
- `root_category VARCHAR(255)` (will be removed in Phase 5)

### Security Note

RLS (Row Level Security) policies are **not enabled** in Phase 2. All authenticated users can currently access all data. RLS will be added in a future phase after basic functionality is verified.

## Next Steps (Phase 3-5)

After Phase 2 is complete:

1. **Phase 3:** Create CRUD hooks and UI components for category management
2. **Phase 4:** Update routing and data layer to use category_id
3. **Phase 5:** Remove legacy root_category column (breaking change)

## Default Category Colors

| Category  | Color   | Hex Code |
|-----------|---------|----------|
| Household | Green   | #10B981  |
| Finances  | Blue    | #3B82F6  |
| Cleo      | Amber   | #F59E0B  |
| Job       | Purple  | #8B5CF6  |
| Social    | Pink    | #EC4899  |
| Personal  | Cyan    | #06B6D4  |
| Orphans   | Gray    | #6B7280  |

## Rollback Instructions

If you need to rollback all Phase 2 changes:

```sql
-- Rollback migration 03 (data)
UPDATE org_nodes SET category_id = NULL;
DELETE FROM categories;

-- Rollback migration 02 (org_nodes column)
DROP INDEX IF EXISTS idx_org_nodes_category_id;
DROP INDEX IF EXISTS idx_org_nodes_user_category;
ALTER TABLE org_nodes DROP COLUMN IF EXISTS category_id;

-- Rollback migration 01 (categories table)
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP INDEX IF EXISTS idx_categories_user_id;
DROP INDEX IF EXISTS idx_categories_user_order;
DROP TABLE IF EXISTS categories;
```

**Warning:** Rollback will delete all category data. Only use if absolutely necessary.

## Support

If you encounter issues:
1. Check verification queries above
2. Review migration file comments
3. Check Supabase logs (Dashboard → Logs → Postgres Logs)
4. Get your user_id by running: SELECT id, email FROM auth.users;
5. Ensure users exist in the auth.users table
