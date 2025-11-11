-- Seed data for fixed meals
-- Run this in Supabase SQL Editor to populate your standard meals

-- Adult fixed meals
INSERT INTO meal_templates (name, meal_type, person, is_fixed, ingredients, notes) VALUES
  (
    'Orange Juice & Peanut Butter',
    'pre-breakfast',
    'adult',
    true,
    '[
      {"name": "orange juice", "quantity": "1 cup"},
      {"name": "peanut butter", "quantity": "2 tbsp"}
    ]'::jsonb,
    'Standard pre-breakfast'
  ),
  (
    'Green Protein Smoothie',
    'smoothie',
    'adult',
    true,
    '[
      {"name": "greek yogurt", "quantity": "1 cup"},
      {"name": "oats", "quantity": "1/2 cup"},
      {"name": "protein powder", "quantity": "1 scoop"},
      {"name": "frozen blueberries", "quantity": "1 cup"},
      {"name": "frozen spinach", "quantity": "1 cup"}
    ]'::jsonb,
    'Standard morning smoothie'
  );

-- Toddler fixed meals
INSERT INTO meal_templates (name, meal_type, person, is_fixed, ingredients, notes) VALUES
  (
    'Toddler Breakfast Bowl',
    'breakfast',
    'toddler',
    true,
    '[
      {"name": "greek yogurt", "quantity": "1/2 cup"},
      {"name": "frozen blueberries", "quantity": "1/4 cup"},
      {"name": "frozen spinach", "quantity": "2 tbsp"},
      {"name": "oats", "quantity": "2 tbsp"},
      {"name": "chia seeds", "quantity": "1 tsp"}
    ]'::jsonb,
    'Toddler yogurt mixture'
  );

-- Variable meal templates (examples you can customize)
INSERT INTO meal_templates (name, meal_type, person, is_fixed, ingredients, notes) VALUES
  (
    'Quiche Slice',
    'breakfast',
    'adult',
    false,
    '[
      {"name": "eggs", "quantity": "6"},
      {"name": "milk", "quantity": "1 cup"},
      {"name": "cheese", "quantity": "1 cup"},
      {"name": "vegetables", "quantity": "1 cup"}
    ]'::jsonb,
    'Batch cook on Sunday'
  ),
  (
    'Waffle w/ Peanut Butter',
    'breakfast',
    'adult',
    false,
    '[
      {"name": "waffles", "quantity": "2"},
      {"name": "peanut butter", "quantity": "2 tbsp"}
    ]'::jsonb,
    null
  ),
  (
    'Toddler Quiche Slice',
    'breakfast',
    'toddler',
    false,
    '[
      {"name": "quiche", "quantity": "1 slice"},
      {"name": "peanut butter", "quantity": "1 tsp"}
    ]'::jsonb,
    null
  ),
  (
    'Toddler Waffle w/ PB',
    'breakfast',
    'toddler',
    false,
    '[
      {"name": "waffle", "quantity": "1"},
      {"name": "peanut butter", "quantity": "1 tbsp"}
    ]'::jsonb,
    null
  ),
  (
    'Protein Bar',
    'snack',
    'adult',
    false,
    '[
      {"name": "protein bar", "quantity": "1"}
    ]'::jsonb,
    'Keep on hand'
  ),
  (
    'Toddler Snack Bar',
    'snack',
    'toddler',
    false,
    '[
      {"name": "kids snack bar", "quantity": "1"}
    ]'::jsonb,
    null
  );
