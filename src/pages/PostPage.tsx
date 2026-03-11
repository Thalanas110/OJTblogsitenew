import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { usePostBySlug, useRecordView } from "@/hooks/useBlog";
import BlogHeader from "@/components/BlogHeader";
import CommentSection from "@/components/CommentSection";
import LikeButton from "@/components/LikeButton";
import { Eye } from "lucide-react";

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
