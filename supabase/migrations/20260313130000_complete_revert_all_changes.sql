-- Complete revert of all security changes
-- Restores original working state before security fixes

-- 1. Drop admin_users table if it exists
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- 2. Revert all Posts RLS policies to permissive state
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can see own unpublished posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can see all posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update any post" ON public.posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete any post" ON public.posts;

CREATE POLICY "Anyone can read published posts"
  ON public.posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage posts"
  ON public.posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Revert Comments RLS policies
DROP POLICY IF EXISTS "Anyone can read approved comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated can read all comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON public.comments;

CREATE POLICY "Anyone can read approved comments"
  ON public.comments FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Anyone can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated can manage comments"
  ON public.comments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Revert Reactions RLS policies
DROP POLICY IF EXISTS "Anyone can read reactions" ON public.reactions;
DROP POLICY IF EXISTS "Anyone can insert reactions" ON public.reactions;
DROP POLICY IF EXISTS "Anyone can delete reactions" ON public.reactions;

CREATE POLICY "Anyone can read reactions"
  ON public.reactions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert reactions"
  ON public.reactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete own reactions"
  ON public.reactions FOR DELETE
  USING (true);

-- 5. Revert Activity Logs RLS policies
DROP POLICY IF EXISTS "Anyone can insert activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can read activity logs" ON public.activity_logs;

CREATE POLICY "Anyone can insert logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated can read logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (true);

-- 6. Drop validation functions if they exist
DROP FUNCTION IF EXISTS public.validate_comment_input(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.validate_post_input(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.record_post_view(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.record_video_play(UUID, TEXT, TEXT);

-- 7. Revert post_views policies
DROP POLICY IF EXISTS "Anyone can insert views" ON public.post_views;

CREATE POLICY "Anyone can insert views"
  ON public.post_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read view counts"
  ON public.post_views FOR SELECT
  USING (true);

-- 8. Revert video_plays policies if table exists
DROP POLICY IF EXISTS "Anyone can insert video plays" ON public.video_plays;

CREATE POLICY "Anyone can insert video plays"
  ON public.video_plays FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read video plays"
  ON public.video_plays FOR SELECT
  USING (true);
