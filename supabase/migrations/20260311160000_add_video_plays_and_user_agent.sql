-- Add user_agent to post_views for browser statistics
ALTER TABLE public.post_views
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Video plays table for tracking YouTube video play events
CREATE TABLE IF NOT EXISTS public.video_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  ip_address TEXT NOT NULL DEFAULT '',
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.video_plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert video plays"
  ON public.video_plays FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated can read video plays"
  ON public.video_plays FOR SELECT
  TO authenticated
  USING (true);

-- Helper function to get video play counts (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_post_video_play_count(p_post_id UUID)
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::BIGINT FROM public.video_plays WHERE post_id = p_post_id;
$$;
