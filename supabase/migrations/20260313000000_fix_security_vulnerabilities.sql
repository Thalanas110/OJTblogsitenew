-- Security Fix: Add admin role and fix RLS policies
-- This migration fixes critical security vulnerabilities

-- 1. Create admin users table to track admin roles
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can see admin users"
  ON public.admin_users FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 2. Fix Posts RLS policies - allow public read of published, authenticated for write
DROP POLICY IF EXISTS "Authenticated users can manage posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.posts;
DROP POLICY IF EXISTS "Admin can read all posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;

CREATE POLICY "Anyone can read published posts"
  ON public.posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authors can see own unpublished posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can see all posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can update any post"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Authors can delete own posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete any post"
  ON public.posts FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 3. Fix Comments RLS policies
DROP POLICY IF EXISTS "Anyone can read approved comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated can read all comments" ON public.comments;
DROP POLICY IF EXISTS "Insert comments with rate limiting" ON public.comments;
DROP POLICY IF EXISTS "Authors can delete own comments" ON public.comments;

CREATE POLICY "Anyone can read approved comments"
  ON public.comments FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Authenticated can see all comments"
  ON public.comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authors can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid()::text = author_id);

CREATE POLICY "Admins can delete any comment"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 4. Fix Reactions RLS policies
DROP POLICY IF EXISTS "Anyone can read reactions" ON public.reactions;
DROP POLICY IF EXISTS "Insert reactions with rate limiting" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON public.reactions;

CREATE POLICY "Anyone can read reactions"
  ON public.reactions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert reactions"
  ON public.reactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own reactions"
  ON public.reactions FOR DELETE
  USING (user_id::text = auth.uid()::text OR ip_address = current_setting('request.client_addr'));

-- 5. Fix Activity Logs RLS policies
DROP POLICY IF EXISTS "System can insert logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Only admins can read activity logs" ON public.activity_logs;

CREATE POLICY "System can insert activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 6. Create input validation function
CREATE OR REPLACE FUNCTION public.validate_comment_input(p_author_name TEXT, p_content TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validate lengths
  IF length(p_author_name) = 0 OR length(p_author_name) > 100 THEN
    RETURN false;
  END IF;
  IF length(p_content) = 0 OR length(p_content) > 1000 THEN
    RETURN false;
  END IF;
  -- Check for suspicious patterns
  IF p_author_name ~ '^\s*$' OR p_content ~ '^\s*$' THEN
    RETURN false;
  END IF;
  RETURN true;
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Create post validation function
CREATE OR REPLACE FUNCTION public.validate_post_input(p_title TEXT, p_content TEXT, p_excerpt TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF length(p_title) = 0 OR length(p_title) > 500 THEN
    RETURN false;
  END IF;
  IF length(p_content) = 0 OR length(p_content) > 50000 THEN
    RETURN false;
  END IF;
  IF length(p_excerpt) > 500 THEN
    RETURN false;
  END IF;
  IF p_title ~ '^\s*$' OR p_content ~ '^\s*$' THEN
    RETURN false;
  END IF;
  RETURN true;
END;
$$ LANGUAGE plpgsql STABLE;

-- 8. Create function to record post views with rate limiting
CREATE OR REPLACE FUNCTION public.record_post_view(p_post_id UUID, p_ip_address TEXT, p_user_agent TEXT)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Only allow one view per IP per post per minute
  IF NOT EXISTS (
    SELECT 1 FROM public.post_views
    WHERE post_id = p_post_id
    AND ip_address = p_ip_address
    AND created_at > now() - interval '1 minute'
  ) THEN
    INSERT INTO public.post_views (post_id, ip_address, user_agent)
    VALUES (p_post_id, p_ip_address, p_user_agent)
    RETURNING id INTO v_id;
    RETURN v_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to record video plays with rate limiting
CREATE OR REPLACE FUNCTION public.record_video_play(p_post_id UUID, p_ip_address TEXT, p_user_agent TEXT)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Only allow one play per IP per post per minute
  IF NOT EXISTS (
    SELECT 1 FROM public.video_plays
    WHERE post_id = p_post_id
    AND ip_address = p_ip_address
    AND created_at > now() - interval '1 minute'
  ) THEN
    INSERT INTO public.video_plays (post_id, ip_address, user_agent)
    VALUES (p_post_id, p_ip_address, p_user_agent)
    RETURNING id INTO v_id;
    RETURN v_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 10. Allow inserts to post_views and video_plays tables
DROP POLICY IF EXISTS "Insert views via function only" ON public.post_views;
DROP POLICY IF EXISTS "Anyone can insert views" ON public.post_views;

CREATE POLICY "Anyone can insert views"
  ON public.post_views FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert plays" ON public.video_plays;

CREATE POLICY "Anyone can insert plays"
  ON public.video_plays FOR INSERT
  WITH CHECK (true);

-- 11. Ensure NOT NULL constraints exist
ALTER TABLE public.post_views
ALTER COLUMN ip_address SET NOT NULL;

ALTER TABLE public.video_plays
ALTER COLUMN ip_address SET NOT NULL;
