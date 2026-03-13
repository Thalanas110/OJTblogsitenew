-- Revert broken RLS policies and restore working configuration
-- This migration reverts the problematic changes from 20260313110000_fix_rls_policies.sql

-- 1. Revert Posts RLS policies
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can see own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can see all posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update any post" ON public.posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete any post" ON public.posts;

-- Restore original working policies
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

-- 2. Revert Comments RLS policies
DROP POLICY IF EXISTS "Anyone can read approved comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated can see all comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Authors can delete own comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.comments;

-- Restore original working policies
CREATE POLICY "Anyone can read approved comments"
  ON public.comments FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Authenticated can read all comments"
  ON public.comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can delete comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 3. Revert Reactions RLS policies
DROP POLICY IF EXISTS "Anyone can read reactions" ON public.reactions;
DROP POLICY IF EXISTS "Anyone can insert reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON public.reactions;

-- Restore original working policies
CREATE POLICY "Anyone can read reactions"
  ON public.reactions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert reactions"
  ON public.reactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete reactions"
  ON public.reactions FOR DELETE
  USING (true);

-- 4. Revert Activity Logs RLS policies
DROP POLICY IF EXISTS "Anyone can insert activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can read activity logs" ON public.activity_logs;

-- Restore original working policies
CREATE POLICY "Anyone can insert activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));
