-- Add missing columns to user_recipes table
ALTER TABLE public.user_recipes 
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add foreign key relationship for recipe_comments to profiles
-- First check if the constraint already exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'recipe_comments_user_id_fkey' 
    AND table_name = 'recipe_comments'
  ) THEN
    ALTER TABLE public.recipe_comments 
    ADD CONSTRAINT recipe_comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key relationship for recipe_reviews to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'recipe_reviews_user_id_fkey' 
    AND table_name = 'recipe_reviews'
  ) THEN
    ALTER TABLE public.recipe_reviews 
    ADD CONSTRAINT recipe_reviews_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;