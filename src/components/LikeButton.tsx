import { Heart } from "lucide-react";
import { useReactionCount, useHasReacted, useToggleReaction } from "@/hooks/useBlog";

interface LikeButtonProps {
  postId: string;
}

export default function LikeButton({ postId }: LikeButtonProps) {
  const { data: count } = useReactionCount(postId);
  const { data: hasReacted } = useHasReacted(postId);
  const toggle = useToggleReaction();

  return (
    <button
      onClick={() => toggle.mutate(postId)}
      disabled={toggle.isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors font-mono text-sm ${
        hasReacted
          ? "bg-primary/10 border-primary text-primary"
          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
      }`}
    >
      <Heart size={16} fill={hasReacted ? "currentColor" : "none"} />
      <span>Like</span>
      <span>{count ?? 0}</span>
    </button>
  );
}
