-- Seed demo data for reels and user recipes

-- Insert demo reels data
INSERT INTO public.recipe_reels (title, description, video_url, thumbnail_url, recipe_id, recipe_type, creator_name, creator_avatar, duration_seconds) VALUES
('Quick Pasta Carbonara', 'Learn to make authentic Italian carbonara in just 15 minutes!', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400', '52772', 'api', 'Chef Marco', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 60),
('Vegan Buddha Bowl', 'Colorful and nutritious bowl packed with superfoods', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 'demo-1', 'user', 'Green Chef Sarah', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100', 45),
('Perfect Scrambled Eggs', 'The secret to restaurant-quality scrambled eggs', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400', 'demo-2', 'user', 'Breakfast King', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', 30),
('Chocolate Chip Cookies', 'Soft and chewy cookies that melt in your mouth', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', 'demo-3', 'user', 'Sweet Baker', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', 90),
('Grilled Salmon', 'Perfectly grilled salmon with herbs and lemon', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', 'demo-4', 'user', 'Seafood Master', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', 75);

-- Insert demo user recipes (approved)
INSERT INTO public.user_recipes (
  user_id, title, description, image_url, category, cuisine, prep_time, cook_time, 
  servings, calories, protein, carbs, fat, cost_per_serving, ingredients, 
  instructions, tags, sustainability_score, status, like_count, view_count
) VALUES 
(
  (SELECT id FROM auth.users LIMIT 1), 
  'Vegan Buddha Bowl',
  'A colorful and nutritious bowl packed with quinoa, roasted vegetables, and tahini dressing',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
  'Vegetarian',
  'International',
  15,
  25,
  2,
  350,
  12,
  45,
  15,
  8.50,
  '[
    {"name": "Quinoa", "amount": "1 cup", "unit": "cups"},
    {"name": "Sweet Potato", "amount": "1", "unit": "medium"},
    {"name": "Chickpeas", "amount": "1", "unit": "can"},
    {"name": "Kale", "amount": "2", "unit": "cups"},
    {"name": "Avocado", "amount": "1", "unit": "medium"},
    {"name": "Tahini", "amount": "2", "unit": "tbsp"},
    {"name": "Lemon", "amount": "1", "unit": "medium"}
  ]',
  '1. Cook quinoa according to package instructions\n2. Roast sweet potato cubes at 400°F for 20 minutes\n3. Massage kale with lemon juice\n4. Mix tahini with water and lemon for dressing\n5. Assemble bowl with all ingredients\n6. Drizzle with tahini dressing',
  '["vegan", "healthy", "gluten-free", "high-protein"]',
  85,
  'approved',
  24,
  156
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Perfect Scrambled Eggs',
  'Creamy, restaurant-quality scrambled eggs with the perfect texture',
  'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600',
  'Breakfast',
  'American',
  5,
  10,
  2,
  180,
  14,
  2,
  12,
  4.00,
  '[
    {"name": "Eggs", "amount": "4", "unit": "large"},
    {"name": "Butter", "amount": "2", "unit": "tbsp"},
    {"name": "Heavy Cream", "amount": "2", "unit": "tbsp"},
    {"name": "Salt", "amount": "1/4", "unit": "tsp"},
    {"name": "Black Pepper", "amount": "1/8", "unit": "tsp"},
    {"name": "Chives", "amount": "1", "unit": "tbsp"}
  ]',
  '1. Whisk eggs with cream, salt, and pepper\n2. Heat butter in non-stick pan over low heat\n3. Add eggs and stir constantly with rubber spatula\n4. Remove from heat when still slightly wet\n5. Garnish with chives and serve immediately',
  '["breakfast", "quick", "protein-rich", "keto-friendly"]',
  70,
  'approved',
  18,
  89
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Chocolate Chip Cookies',
  'Soft and chewy chocolate chip cookies that stay fresh for days',
  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600',
  'Dessert',
  'American',
  15,
  12,
  24,
  95,
  1,
  12,
  4,
  3.25,
  '[
    {"name": "All-Purpose Flour", "amount": "2 1/4", "unit": "cups"},
    {"name": "Baking Soda", "amount": "1", "unit": "tsp"},
    {"name": "Salt", "amount": "1", "unit": "tsp"},
    {"name": "Butter", "amount": "1", "unit": "cup"},
    {"name": "Brown Sugar", "amount": "3/4", "unit": "cup"},
    {"name": "White Sugar", "amount": "1/4", "unit": "cup"},
    {"name": "Vanilla Extract", "amount": "1", "unit": "tsp"},
    {"name": "Eggs", "amount": "2", "unit": "large"},
    {"name": "Chocolate Chips", "amount": "2", "unit": "cups"}
  ]',
  '1. Preheat oven to 375°F\n2. Mix flour, baking soda, and salt in bowl\n3. Cream butter and sugars until fluffy\n4. Beat in vanilla and eggs\n5. Gradually mix in flour mixture\n6. Fold in chocolate chips\n7. Drop rounded tablespoons onto baking sheet\n8. Bake 9-11 minutes until golden',
  '["dessert", "baking", "chocolate", "family-favorite"]',
  60,
  'approved',
  42,
  203
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Grilled Salmon with Herbs',
  'Perfectly grilled salmon with fresh herbs and lemon butter sauce',
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600',
  'Seafood',
  'Mediterranean',
  10,
  15,
  4,
  280,
  35,
  2,
  15,
  12.00,
  '[
    {"name": "Salmon Fillet", "amount": "1.5", "unit": "lbs"},
    {"name": "Olive Oil", "amount": "2", "unit": "tbsp"},
    {"name": "Lemon", "amount": "1", "unit": "medium"},
    {"name": "Dill", "amount": "2", "unit": "tbsp"},
    {"name": "Parsley", "amount": "2", "unit": "tbsp"},
    {"name": "Garlic", "amount": "2", "unit": "cloves"},
    {"name": "Butter", "amount": "3", "unit": "tbsp"},
    {"name": "Salt", "amount": "1", "unit": "tsp"},
    {"name": "Black Pepper", "amount": "1/2", "unit": "tsp"}
  ]',
  '1. Preheat grill to medium-high heat\n2. Pat salmon dry and season with salt and pepper\n3. Mix olive oil, garlic, and herbs\n4. Brush herb mixture on salmon\n5. Grill skin-side down for 6-7 minutes\n6. Flip and grill 4-5 minutes more\n7. Make lemon butter sauce\n8. Serve with sauce and lemon wedges',
  '["seafood", "grilled", "healthy", "omega-3", "gluten-free"]',
  90,
  'approved',
  31,
  127
);

-- Insert some demo likes for the user recipes
INSERT INTO public.recipe_likes (user_id, recipe_id, recipe_type)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  id::text,
  'user'
FROM public.user_recipes 
WHERE status = 'approved'
LIMIT 2;

-- Insert some demo comments
INSERT INTO public.recipe_comments (user_id, recipe_id, recipe_type, content)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  id::text,
  'user',
  'This looks amazing! Can''t wait to try it.'
FROM public.user_recipes 
WHERE status = 'approved'
LIMIT 2;

-- Insert some demo reviews
INSERT INTO public.recipe_reviews (user_id, recipe_id, recipe_type, rating, comment)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  id::text,
  'user',
  4.5,
  'Delicious recipe! Easy to follow and turned out perfectly.'
FROM public.user_recipes 
WHERE status = 'approved'
LIMIT 2;
