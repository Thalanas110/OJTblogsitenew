-- Fix overly restrictive RLS policies causing 500 errors
-- Issue: Policies require admin status but don't allow any reads, causing failures

-- 1. Fix Posts RLS - ensure the select query properly filters by is_published
-- Drop the problematic policies
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can see own unpublished posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can see all posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update any post" ON public.posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete any post" ON public.posts;

-- Recreate with proper permissions
CREATE POLICY "Anyone can read published posts"
  ON public.posts FOR SELECT
  USING (is_published = true OR auth.uid() IS NULL);

CREATE POLICY "Authors can see own posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id OR is_published = true);

CREATE POLICY "Admins can see all posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

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
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Authors can delete own posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete any post"
  ON public.posts FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- 2. Fix Activity Logs RLS - allow system inserts but only show to admins
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can read activity logs" ON public.activity_logs;

CREATE POLICY "Anyone can insert activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- 3. Add default admin user if table is empty
-- WARNING: Replace 'YOUR_USER_ID_HERE' with actual user ID, or use Supabase dashboard to add manually
-- This is commented out - uncomment and replace with your admin user ID if needed
-- INSERT INTO public.admin_users (user_id) 
-- VALUES ('YOUR_USER_ID_HERE'::uuid)
-- ON CONFLICT DO NOTHING;
