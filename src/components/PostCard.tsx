import { Link } from "react-router-dom";
import { Eye, MessageSquare, Youtube } from "lucide-react";
import type { PostWithStats } from "@/types/blog";

interface PostCardProps {
  post: PostWithStats;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="blog-card flex flex-col">
      {/* Title section */}
      <div className="p-4 pb-2">
        <div className="flex items-start gap-2">
          {post.youtube_url && (
            <Youtube size={16} className="text-red-500 flex-shrink-0 mt-1" />
          )}
          <h2 className="font-mono text-base md:text-lg font-bold text-card-foreground leading-tight">
            {post.title}
          </h2>
        </div>
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

      {/* Cover image */}
      {post.cover_image_url && (
        <div className="px-4">
          <div className="rounded-md overflow-hidden aspect-video bg-muted">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
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
