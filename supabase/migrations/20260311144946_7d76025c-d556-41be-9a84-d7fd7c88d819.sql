
-- Fix 1: Restrict reaction deletion to own IP
DROP POLICY "Anyone can delete own reactions" ON public.reactions;

CREATE POLICY "Users can delete own reactions by IP"
  ON public.reactions FOR DELETE
  USING (ip_address = current_setting('request.headers', true)::json->>'x-forwarded-for');

-- Fix 2: Create a view that hides ip_address from post_views
CREATE VIEW public.post_views_public
WITH (security_invoker = on) AS
  SELECT id, post_id, created_at
  FROM public.post_views;

-- Restrict direct SELECT on post_views to authenticated only
DROP POLICY "Anyone can read view counts" ON public.post_views;

CREATE POLICY "Authenticated can read post_views"
  ON public.post_views FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can read post_views_public view"
  ON public.post_views FOR SELECT
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'anon'
    AND (SELECT current_query() LIKE '%post_views_public%')
  );
