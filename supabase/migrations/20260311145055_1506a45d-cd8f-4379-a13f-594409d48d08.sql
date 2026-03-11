
-- Drop the broken policy that tried to detect view usage
DROP POLICY IF EXISTS "Public can read post_views_public view" ON public.post_views;

-- Drop the view, recreate without security_invoker so it uses definer privileges
DROP VIEW IF EXISTS public.post_views_public;

-- Create a security definer function to get view counts safely
CREATE OR REPLACE FUNCTION public.get_post_view_counts(post_ids UUID[])
RETURNS TABLE(post_id UUID, view_count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pv.post_id, COUNT(*)::BIGINT as view_count
  FROM public.post_views pv
  WHERE pv.post_id = ANY(post_ids)
  GROUP BY pv.post_id;
$$;

CREATE OR REPLACE FUNCTION public.get_single_post_view_count(p_post_id UUID)
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::BIGINT
  FROM public.post_views
  WHERE post_id = p_post_id;
$$;
