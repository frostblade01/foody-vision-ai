-- Add social features and missing fields to existing tables

-- Add status and social fields to user_recipes
ALTER TABLE public.user_recipes 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Create recipe_comments table
CREATE TABLE public.recipe_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  recipe_type TEXT NOT NULL CHECK (recipe_type IN ('api', 'user')),
  parent_comment_id UUID REFERENCES public.recipe_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.recipe_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON public.recipe_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own comments"
  ON public.recipe_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.recipe_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.recipe_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_follows table
CREATE TABLE public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone"
  ON public.user_follows FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own follows"
  ON public.user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
  ON public.user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Create recipe_reels table for demo video content
CREATE TABLE public.recipe_reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  recipe_id TEXT,
  recipe_type TEXT CHECK (recipe_type IN ('api', 'user')),
  creator_name TEXT DEFAULT 'Foodyfy Team',
  creator_avatar TEXT,
  duration_seconds INTEGER,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.recipe_reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reels are viewable by everyone"
  ON public.recipe_reels FOR SELECT
  USING (true);

-- Create reel_likes table
CREATE TABLE public.reel_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reel_id UUID NOT NULL REFERENCES public.recipe_reels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, reel_id)
);

ALTER TABLE public.reel_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reel likes are viewable by everyone"
  ON public.reel_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own reel likes"
  ON public.reel_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reel likes"
  ON public.reel_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update like counts
CREATE OR REPLACE FUNCTION public.update_recipe_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_recipes 
    SET like_count = like_count + 1 
    WHERE id::text = NEW.recipe_id AND NEW.recipe_type = 'user';
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_recipes 
    SET like_count = GREATEST(like_count - 1, 0) 
    WHERE id::text = OLD.recipe_id AND OLD.recipe_type = 'user';
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for recipe likes
CREATE TRIGGER update_recipe_like_count_trigger
  AFTER INSERT OR DELETE ON public.recipe_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_recipe_like_count();

-- Create function to update reel like counts
CREATE OR REPLACE FUNCTION public.update_reel_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.recipe_reels 
    SET like_count = like_count + 1 
    WHERE id = NEW.reel_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.recipe_reels 
    SET like_count = GREATEST(like_count - 1, 0) 
    WHERE id = OLD.reel_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for reel likes
CREATE TRIGGER update_reel_like_count_trigger
  AFTER INSERT OR DELETE ON public.reel_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_reel_like_count();

-- Create trigger for comment updated_at
CREATE TRIGGER update_recipe_comments_updated_at
  BEFORE UPDATE ON public.recipe_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
