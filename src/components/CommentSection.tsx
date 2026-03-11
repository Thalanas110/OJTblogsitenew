import { useState } from "react";
import { useComments, useAddComment } from "@/hooks/useBlog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { data: comments, isLoading } = useComments(postId);
  const addComment = useAddComment();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (name.length > 100 || content.length > 1000) {
      toast.error("Input too long");
      return;
    }
    addComment.mutate(
      { postId, authorName: name.trim(), content: content.trim() },
      {
        onSuccess: () => {
          setName("");
          setContent("");
          toast.success("Comment posted!");
        },
        onError: () => toast.error("Failed to post comment"),
      }
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 mt-4">
      <h3 className="font-mono text-lg font-bold text-card-foreground mb-4">Comments</h3>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading comments...</p>
      ) : (
        <div className="space-y-4 mb-6">
          {comments?.length === 0 && (
            <p className="text-muted-foreground text-sm">No comments yet. Be the first!</p>
          )}
          {comments?.map((c) => (
            <div key={c.id} className="border-l-2 border-primary/30 pl-4 py-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-semibold text-card-foreground">{c.author_name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-card-foreground">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="font-mono text-sm"
        />
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={3}
          className="font-mono text-sm"
        />
        <Button type="submit" disabled={addComment.isPending} className="font-mono text-sm">
          {addComment.isPending ? "Posting..." : "Post Comment"}
        </Button>
      </form>
    </div>
  );
}
