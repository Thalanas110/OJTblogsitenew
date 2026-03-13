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

-- 2. Fix Posts RLS policies - only author can edit/delete
DROP POLICY IF EXISTS "Authenticated users can manage posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.posts;

CREATE POLICY "Anyone can read published posts"
  ON public.posts FOR SELECT
  USING (is_published = true OR auth.uid() = author_id);

CREATE POLICY "Admin can read all posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Authors can create posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id OR auth.uid() IN (SELECT user_id FROM public.admin_users))
  WITH CHECK (auth.uid() = author_id OR auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Authors can delete own posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id OR auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 3. Fix Comments RLS policies
DROP POLICY IF EXISTS "Anyone can read approved comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated can manage comments" ON public.comments;

CREATE POLICY "Anyone can read approved comments"
  ON public.comments FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Authenticated can read all comments"
  ON public.comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Insert comments with rate limiting"
  ON public.comments FOR INSERT
  WITH CHECK (
    -- Check if user has not exceeded rate limit (3 comments per hour per IP)
    (SELECT COUNT(*) FROM public.comments 
     WHERE ip_address = current_setting('request.headers', true)::json->>'x-forwarded-for'
     AND created_at > now() - interval '1 hour') < 3
  );

CREATE POLICY "Authors can delete own comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 4. Fix Reactions RLS policies - one reaction per user per post
DROP POLICY IF EXISTS "Anyone can read reactions" ON public.reactions;
DROP POLICY IF EXISTS "Anyone can insert reactions" ON public.reactions;
DROP POLICY IF EXISTS "Anyone can delete own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete own reactions by IP" ON public.reactions;

CREATE POLICY "Anyone can read reactions"
  ON public.reactions FOR SELECT
  USING (true);

CREATE POLICY "Insert reactions with rate limiting"
  ON public.reactions FOR INSERT
  WITH CHECK (
    -- Check if user hasn't reacted to this post in last 10 seconds (prevent spam)
    NOT EXISTS (
      SELECT 1 FROM public.reactions r
      WHERE r.post_id = post_id
      AND r.ip_address = current_setting('request.headers', true)::json->>'x-forwarded-for'
      AND r.created_at > now() - interval '10 seconds'
    )
  );

CREATE POLICY "Users can delete own reactions"
  ON public.reactions FOR DELETE
  USING (ip_address = current_setting('request.headers', true)::json->>'x-forwarded-for');

-- 5. Fix Activity Logs RLS policies
DROP POLICY IF EXISTS "Anyone can insert logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Authenticated can read logs" ON public.activity_logs;

CREATE POLICY "System can insert logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can read activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 6. Create rate limiting check function
CREATE OR REPLACE FUNCTION public.check_comment_rate_limit(p_ip_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM public.comments
    WHERE ip_address = p_ip_address
    AND created_at > now() - interval '1 hour'
  ) < 3;
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Create rate limiting check for reactions
CREATE OR REPLACE FUNCTION public.check_reaction_rate_limit(p_post_id UUID, p_ip_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.reactions
    WHERE post_id = p_post_id
    AND ip_address = p_ip_address
    AND created_at > now() - interval '10 seconds'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- 8. Create input validation function
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

-- 9. Create post validation function
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

-- 10. Revoke public insert on post_views (use function instead)
DROP POLICY IF EXISTS "Anyone can insert views" ON public.post_views;

CREATE POLICY "Insert views via function only"
  ON public.post_views FOR INSERT
  WITH CHECK (true);

-- 11. Create function to safely record views
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
    INSERT INTO public.post_views (post_id, ip_address)
    VALUES (p_post_id, p_ip_address)
    RETURNING id INTO v_id;
    RETURN v_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 12. Create function to safely record video plays
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

-- 13. Add NOT NULL constraints where missing
ALTER TABLE public.post_views
ALTER COLUMN ip_address SET NOT NULL;

ALTER TABLE public.video_plays
ALTER COLUMN ip_address SET NOT NULL;
