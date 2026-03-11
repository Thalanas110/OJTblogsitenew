-- Add youtube_url column to posts table for vlog support
ALTER TABLE public.posts
  ADD COLUMN youtube_url TEXT;
