import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPosts, fetchAllPosts, fetchPostBySlug, fetchPostById,
  createPost, updatePost, deletePost, togglePinPost,
  fetchComments, fetchAllComments, addComment, deleteComment, toggleCommentApproval,
  fetchReactionCount, hasUserReacted, toggleReaction,
  recordView, recordVideoPlay, fetchActivityLogs,
  fetchPostViewsByDate, fetchAllViewsByDate,
  fetchVideoPlayCount, fetchHourlyViewDistribution,
  fetchPostViewsDetails, fetchRecentVideoPlays,
} from "@/lib/api";

export function usePosts() {
  return useQuery({ queryKey: ["posts"], queryFn: fetchPosts });
}

export function useAllPosts() {
  return useQuery({ queryKey: ["admin-posts"], queryFn: fetchAllPosts });
}

export function usePostBySlug(slug: string) {
  return useQuery({ queryKey: ["post", slug], queryFn: () => fetchPostBySlug(slug), enabled: !!slug });
}

export function usePostById(id: string) {
  return useQuery({ queryKey: ["post-id", id], queryFn: () => fetchPostById(id), enabled: !!id });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); qc.invalidateQueries({ queryKey: ["admin-posts"] }); },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) => updatePost(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); qc.invalidateQueries({ queryKey: ["admin-posts"] }); },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); qc.invalidateQueries({ queryKey: ["admin-posts"] }); },
  });
}

export function useTogglePin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) => togglePinPost(id, isPinned),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); qc.invalidateQueries({ queryKey: ["admin-posts"] }); },
  });
}

export function useComments(postId: string) {
  return useQuery({ queryKey: ["comments", postId], queryFn: () => fetchComments(postId), enabled: !!postId });
}

export function useAllComments() {
  return useQuery({ queryKey: ["all-comments"], queryFn: fetchAllComments });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, authorName, content }: { postId: string; authorName: string; content: string }) =>
      addComment(postId, authorName, content),
    onSuccess: (_d, vars) => { qc.invalidateQueries({ queryKey: ["comments", vars.postId] }); },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["all-comments"] }); },
  });
}

export function useToggleCommentApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) => toggleCommentApproval(id, isApproved),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["all-comments"] }); },
  });
}

export function useReactionCount(postId: string) {
  return useQuery({ queryKey: ["reaction-count", postId], queryFn: () => fetchReactionCount(postId), enabled: !!postId });
}

export function useHasReacted(postId: string) {
  return useQuery({ queryKey: ["has-reacted", postId], queryFn: () => hasUserReacted(postId), enabled: !!postId });
}

export function useToggleReaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleReaction,
    onSuccess: (_d, postId) => {
      qc.invalidateQueries({ queryKey: ["reaction-count", postId] });
      qc.invalidateQueries({ queryKey: ["has-reacted", postId] });
    },
  });
}

export function useRecordView() {
  return useMutation({ mutationFn: recordView });
}

export function useActivityLogs() {
  return useQuery({ queryKey: ["activity-logs"], queryFn: fetchActivityLogs });
}

export function usePostViewsByDate(postId: string) {
  return useQuery({ queryKey: ["post-views-date", postId], queryFn: () => fetchPostViewsByDate(postId), enabled: !!postId });
}

export function useAllViewsByDate() {
  return useQuery({ queryKey: ["all-views-by-date"], queryFn: fetchAllViewsByDate });
}

export function useVideoPlayCount(postId: string) {
  return useQuery({ queryKey: ["video-play-count", postId], queryFn: () => fetchVideoPlayCount(postId), enabled: !!postId });
}

export function useHourlyViewDistribution(postId: string) {
  return useQuery({ queryKey: ["hourly-views", postId], queryFn: () => fetchHourlyViewDistribution(postId), enabled: !!postId });
}

export function usePostViewsDetails(postId: string) {
  return useQuery({ queryKey: ["post-views-details", postId], queryFn: () => fetchPostViewsDetails(postId), enabled: !!postId });
}

export function useRecentVideoPlays(postId: string) {
  return useQuery({ queryKey: ["recent-video-plays", postId], queryFn: () => fetchRecentVideoPlays(postId), enabled: !!postId });
}

export function useRecordVideoPlay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: recordVideoPlay,
    onSuccess: (_d, postId) => {
      qc.invalidateQueries({ queryKey: ["video-play-count", postId] });
      qc.invalidateQueries({ queryKey: ["recent-video-plays", postId] });
    },
  });
}
