import { Link } from "react-router-dom";
import { Eye, MessageSquare, PlayCircle } from "lucide-react";
import type { PostWithStats } from "@/types/blog";

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0] || null;
    if (u.hostname === "www.youtube.com" || u.hostname === "youtube.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const embedMatch = u.pathname.match(/^\/embed\/([^/?]+)/);
      if (embedMatch) return embedMatch[1];
    }
  } catch { /* invalid URL */ }
  return null;
}

interface PostCardProps {
  post: PostWithStats;
}

export default function PostCard({ post }: PostCardProps) {
  const youtubeId = post.youtube_url ? getYouTubeId(post.youtube_url) : null;
  const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;

  return (
    <div className="blog-card flex flex-col">
      {/* Title section */}
      <div className="p-4 pb-2">
        <h2 className="font-mono text-base md:text-lg font-bold text-card-foreground leading-tight">
          {post.title}
        </h2>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-mono text-muted-foreground">
            {new Date(post.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye size={14} /> {post.view_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={14} /> {post.comment_count}
            </span>
          </div>
        </div>
      </div>

      {/* YouTube thumbnail with play button overlay, or plain cover image */}
      {(thumbnailUrl || post.cover_image_url) && (
        <div className="px-4">
          <Link to={`/post/${post.slug}`} className="block">
            <div className="rounded-md overflow-hidden aspect-video bg-muted relative group">
              <img
                src={thumbnailUrl ?? post.cover_image_url!}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
              />
              {thumbnailUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 rounded-full p-2 group-hover:bg-red-600 transition-colors duration-200">
                    <PlayCircle size={40} className="text-white" fill="white" />
                  </div>
                </div>
              )}
            </div>
          </Link>
        </div>
      )}

      {/* Excerpt */}
      <div className="p-4 pt-3 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {post.excerpt}
        </p>
        <Link
          to={`/post/${post.slug}`}
          className="text-primary font-mono text-sm font-semibold hover:underline mt-auto"
        >
          Read More
        </Link>
      </div>

      {/* Pinned badge */}
      {post.is_pinned && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-mono px-2 py-0.5 rounded">
          Pinned
        </div>
      )}
    </div>
  );
}
