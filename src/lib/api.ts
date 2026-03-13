import { supabase } from "@/integrations/supabase/client";
import type { Post, Comment, Reaction, ActivityLog, PostWithStats } from "@/types/blog";

// ─── Session ID helper (replaced IP with secure session ID) ───
let cachedSessionId: string | null = null;

export function getOrCreateSessionId(): string {
  if (cachedSessionId) return cachedSessionId;
  
  let sessionId = localStorage.getItem('blog_session_id');
  if (!sessionId) {
    // Create a unique session ID for this browser
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('blog_session_id', sessionId);
  }
  cachedSessionId = sessionId;
  return sessionId;
}

// ─── Posts ───
export async function fetchPosts(): Promise<PostWithStats[]> {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  const postIds = (posts || []).map((p: Post) => p.id);
  if (postIds.length === 0) return [];

  const [viewResult, comments, reactions] = await Promise.all([
    supabase.rpc("get_post_view_counts", { post_ids: postIds } as never),
    supabase.from("comments").select("post_id").in("post_id", postIds),
    supabase.from("reactions").select("post_id").in("post_id", postIds),
  ]);

  const viewCounts: Record<string, number> = {};
  const commentCounts: Record<string, number> = {};
  const reactionCounts: Record<string, number> = {};

  ((viewResult.data as { post_id: string; view_count: number }[]) || []).forEach((v) => {
    viewCounts[v.post_id] = v.view_count;
  });
  (comments.data || []).forEach((c: { post_id: string }) => {
    commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
  });
  (reactions.data || []).forEach((r: { post_id: string }) => {
    reactionCounts[r.post_id] = (reactionCounts[r.post_id] || 0) + 1;
  });

  return (posts || []).map((p: Post) => ({
    ...p,
    view_count: viewCounts[p.id] || 0,
    comment_count: commentCounts[p.id] || 0,
    reaction_count: reactionCounts[p.id] || 0,
  }));
}

export async function fetchAllPosts(): Promise<PostWithStats[]> {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  const postIds = (posts || []).map((p: Post) => p.id);
  if (postIds.length === 0) return [];

  const [views, comments, reactions] = await Promise.all([
    supabase.from("post_views").select("post_id").in("post_id", postIds),
    supabase.from("comments").select("post_id").in("post_id", postIds),
    supabase.from("reactions").select("post_id").in("post_id", postIds),
  ]);

  const viewCounts: Record<string, number> = {};
  const commentCounts: Record<string, number> = {};
  const reactionCounts: Record<string, number> = {};

  (views.data || []).forEach((v: { post_id: string }) => {
    viewCounts[v.post_id] = (viewCounts[v.post_id] || 0) + 1;
  });
  (comments.data || []).forEach((c: { post_id: string }) => {
    commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
  });
  (reactions.data || []).forEach((r: { post_id: string }) => {
    reactionCounts[r.post_id] = (reactionCounts[r.post_id] || 0) + 1;
  });

  return (posts || []).map((p: Post) => ({
    ...p,
    view_count: viewCounts[p.id] || 0,
    comment_count: commentCounts[p.id] || 0,
    reaction_count: reactionCounts[p.id] || 0,
  }));
}

export async function fetchPostBySlug(slug: string): Promise<PostWithStats | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const [viewCount, comments, reactions] = await Promise.all([
    supabase.rpc("get_single_post_view_count", { p_post_id: data.id } as never),
    supabase.from("comments").select("id").eq("post_id", data.id),
    supabase.from("reactions").select("id").eq("post_id", data.id),
  ]);

  return {
    ...data,
    view_count: (viewCount.data as number) || 0,
    comment_count: comments.data?.length || 0,
    reaction_count: reactions.data?.length || 0,
  };
}

export async function fetchPostById(id: string): Promise<PostWithStats | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const [views, comments, reactions] = await Promise.all([
    supabase.from("post_views").select("id").eq("post_id", data.id),
    supabase.from("comments").select("id").eq("post_id", data.id),
    supabase.from("reactions").select("id").eq("post_id", data.id),
  ]);

  return {
    ...data,
    view_count: views.data?.length || 0,
    comment_count: comments.data?.length || 0,
    reaction_count: reactions.data?.length || 0,
  };
}

export async function createPost(post: { title: string; content: string; excerpt: string; cover_image_url?: string; youtube_url?: string; is_published?: boolean }) {
  const slug = post.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  const { data, error } = await supabase
    .from("posts")
    .insert({ ...post, slug })
    .select()
    .single();
  if (error) throw error;

  await logActivity("create", "post", data.id, { title: post.title });
  return data;
}

export async function updatePost(id: string, updates: Partial<Post>) {
  if (updates.title) {
    updates.slug = updates.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  }
  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  await logActivity("update", "post", id, { updates: Object.keys(updates) });
  return data;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
  await logActivity("delete", "post", id, {});
}

export async function togglePinPost(id: string, isPinned: boolean) {
  const { error } = await supabase.from("posts").update({ is_pinned: !isPinned }).eq("id", id);
  if (error) throw error;
  await logActivity(isPinned ? "unpin" : "pin", "post", id, {});
}

// ─── Views ───
export async function recordView(postId: string) {
  const sessionId = getOrCreateSessionId();
  await supabase.from("post_views").insert({
    post_id: postId,
    ip_address: sessionId,
  });
}

export async function recordVideoPlay(postId: string) {
  const sessionId = getOrCreateSessionId();
  await supabase.from("video_plays").insert({
    post_id: postId,
    ip_address: sessionId,
    user_agent: navigator.userAgent,
  });
}

export async function fetchVideoPlayCount(postId: string): Promise<number> {
  const { data, error } = await supabase
    .rpc("get_post_video_play_count", { p_post_id: postId } as never);
  if (error) throw error;
  return (data as number) || 0;
}

export async function fetchHourlyViewDistribution(postId: string): Promise<{ hour: string; count: number }[]> {
  const { data, error } = await supabase
    .from("post_views")
    .select("created_at")
    .eq("post_id", postId);
  if (error) throw error;

  const grouped: Record<number, number> = {};
  (data || []).forEach((v: { created_at: string }) => {
    const h = new Date(v.created_at).getHours();
    grouped[h] = (grouped[h] || 0) + 1;
  });

  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    count: grouped[i] || 0,
  }));
}

export async function fetchPostViewsDetails(postId: string): Promise<{ created_at: string; user_agent: string | null; ip_address: string }[]> {
  const { data, error } = await supabase
    .from("post_views")
    .select("created_at, user_agent, ip_address")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as { created_at: string; user_agent: string | null; ip_address: string }[];
}

export async function fetchRecentVideoPlays(postId: string): Promise<{ id: string; created_at: string; user_agent: string | null; ip_address: string }[]> {
  const { data, error } = await supabase
    .from("video_plays")
    .select("id, created_at, user_agent, ip_address")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data || []) as { id: string; created_at: string; user_agent: string | null; ip_address: string }[];
}

// ─── Comments ───
export async function fetchComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchAllComments(): Promise<(Comment & { post_title?: string })[]> {
  const { data: comments, error } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const postIds = [...new Set((comments || []).map((c: Comment) => c.post_id))];
  if (postIds.length === 0) return [];

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title")
    .in("id", postIds);

  const titleMap: Record<string, string> = {};
  (posts || []).forEach((p: { id: string; title: string }) => {
    titleMap[p.id] = p.title;
  });

  return (comments || []).map((c: Comment) => ({
    ...c,
    post_title: titleMap[c.post_id] || "Unknown",
  }));
}

export async function addComment(postId: string, authorName: string, content: string) {
  const sessionId = getOrCreateSessionId();
  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_name: authorName, content, ip_address: sessionId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteComment(id: string) {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
  await logActivity("delete", "comment", id, {});
}

export async function toggleCommentApproval(id: string, isApproved: boolean) {
  const { error } = await supabase.from("comments").update({ is_approved: !isApproved }).eq("id", id);
  if (error) throw error;
}

// ─── Reactions ───
export async function fetchReactionCount(postId: string): Promise<number> {
  const { data, error } = await supabase
    .from("reactions")
    .select("id")
    .eq("post_id", postId);
  if (error) throw error;
  return data?.length || 0;
}

export async function hasUserReacted(postId: string): Promise<boolean> {
  const sessionId = getOrCreateSessionId();
  const { data, error } = await supabase
    .from("reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("ip_address", sessionId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function toggleReaction(postId: string) {
  const sessionId = getOrCreateSessionId();
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("ip_address", sessionId)
    .maybeSingle();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
  } else {
    await supabase.from("reactions").insert({ post_id: postId, ip_address: sessionId, reaction_type: "like" });
  }
}

// ─── Activity Logs ───
export async function logActivity(action: string, entityType: string, entityId: string | null, details: Record<string, unknown>) {
  const sessionId = getOrCreateSessionId();
  await supabase.from("activity_logs").insert({
    action,
    entity_type: entityType,
    entity_id: entityId,
    details: details as unknown,
    ip_address: sessionId,
  } as never);
}

export async function fetchActivityLogs(): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data || []).map((d: Record<string, unknown>) => ({
    ...d,
    details: (d.details || {}) as Record<string, unknown>,
  })) as ActivityLog[];
}

// ─── Auth ───
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(callback: (session: unknown) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

// ─── All Views by date (last 30 days) ───
export async function fetchAllViewsByDate(): Promise<{ date: string; count: number }[]> {
  const since = new Date();
  since.setDate(since.getDate() - 29);
  const { data, error } = await supabase
    .from("post_views")
    .select("created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });
  if (error) throw error;

  const grouped: Record<string, number> = {};
  (data || []).forEach((v: { created_at: string }) => {
    const date = v.created_at.split("T")[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });

  return Object.entries(grouped).map(([date, count]) => ({ date, count }));
}

// ─── Post Views by date ───
export async function fetchPostViewsByDate(postId: string): Promise<{ date: string; count: number }[]> {
  const { data, error } = await supabase
    .from("post_views")
    .select("created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  
  const grouped: Record<string, number> = {};
  (data || []).forEach((v: { created_at: string }) => {
    const date = v.created_at.split("T")[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });
  
  return Object.entries(grouped).map(([date, count]) => ({ date, count }));
}
