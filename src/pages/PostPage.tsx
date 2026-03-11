import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { usePostBySlug, useRecordView } from "@/hooks/useBlog";
import BlogHeader from "@/components/BlogHeader";
import CommentSection from "@/components/CommentSection";
import LikeButton from "@/components/LikeButton";
import { Eye, Youtube } from "lucide-react";

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // youtu.be/VIDEO_ID
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1).split("?")[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    // youtube.com/watch?v=VIDEO_ID
    if (u.hostname === "www.youtube.com" || u.hostname === "youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
      // youtube.com/embed/VIDEO_ID — swap to nocookie
      if (u.pathname.startsWith("/embed/")) {
        return url.replace("www.youtube.com", "www.youtube-nocookie.com");
      }
    }
  } catch {
    // invalid URL
  }
  return null;
}

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = usePostBySlug(slug || "");
  const recordView = useRecordView();

  useEffect(() => {
    if (post?.id) {
      recordView.mutate(post.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen blog-bg">
        <div className="min-h-screen blog-bg-overlay">
          <BlogHeader />
          <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="bg-card rounded-lg border border-border p-8 animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="aspect-video bg-muted rounded" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen blog-bg">
        <div className="min-h-screen blog-bg-overlay">
          <BlogHeader />
          <div className="container mx-auto px-4 py-20 text-center max-w-3xl">
            <p className="font-mono text-lg text-muted-foreground">Post not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen blog-bg">
      <div className="min-h-screen blog-bg-overlay">
        <BlogHeader />
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <article className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-6 md:p-8">
              <h1 className="font-mono text-2xl md:text-3xl font-bold text-card-foreground leading-tight mb-3">
                {post.title}
              </h1>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-sm text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye size={14} /> {post.view_count} views
                </span>
              </div>

              {post.cover_image_url && (
                <div className="rounded-lg overflow-hidden mb-6">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full object-cover"
                  />
                </div>
              )}

              {post.youtube_url && getYouTubeEmbedUrl(post.youtube_url) && (
                <div className="mb-6">
                  <div className="rounded-lg overflow-hidden aspect-video">
                    <iframe
                      src={`${getYouTubeEmbedUrl(post.youtube_url)!}?rel=0&modestbranding=1`}
                      title={post.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                  <a
                    href={post.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-mono text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Youtube size={13} /> Watch on YouTube
                  </a>
                </div>
              )}

              <div className="prose prose-sm max-w-none text-card-foreground whitespace-pre-wrap">
                {post.content}
              </div>

              <div className="mt-8 pt-4 border-t border-border">
                <LikeButton postId={post.id} />
              </div>
            </div>
          </article>

          <CommentSection postId={post.id} />
        </main>
      </div>
    </div>
  );
}
