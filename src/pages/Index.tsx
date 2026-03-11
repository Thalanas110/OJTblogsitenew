import { usePosts } from "@/hooks/useBlog";
import PostCard from "@/components/PostCard";
import BlogHeader from "@/components/BlogHeader";

export default function HomePage() {
  const { data: posts, isLoading } = usePosts();

  return (
    <div className="min-h-screen blog-bg">
      <div className="min-h-screen blog-bg-overlay">
        <BlogHeader />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="blog-card animate-pulse">
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="aspect-video bg-muted rounded" />
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts?.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-mono text-lg text-muted-foreground">No posts yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts?.map((post) => (
                <div key={post.id} className="relative">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
