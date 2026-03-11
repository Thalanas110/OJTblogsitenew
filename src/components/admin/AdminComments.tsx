import { useAllComments, useDeleteComment, useToggleCommentApproval } from "@/hooks/useBlog";
import { Button } from "@/components/ui/button";
import { Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function AdminComments() {
  const { data: comments, isLoading } = useAllComments();
  const deleteComment = useDeleteComment();
  const toggleApproval = useToggleCommentApproval();

  if (isLoading) return <p className="text-muted-foreground font-mono text-sm">Loading...</p>;

  return (
    <div className="space-y-4">
      <h2 className="font-mono text-lg font-bold text-foreground">Comments ({comments?.length || 0})</h2>
      <div className="space-y-2">
        {comments?.map((c) => (
          <div key={c.id} className="bg-card rounded-lg border border-border p-4 flex flex-col md:flex-row md:items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold text-card-foreground">{c.author_name}</span>
                <span className="text-xs text-muted-foreground">on {c.post_title}</span>
                <span className="text-xs text-muted-foreground">• {new Date(c.created_at).toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">• IP: {c.ip_address}</span>
                {!c.is_approved && <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded font-mono">Hidden</span>}
              </div>
              <p className="text-sm text-card-foreground mt-1">{c.content}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleApproval.mutate({ id: c.id, isApproved: c.is_approved })}
                title={c.is_approved ? "Hide" : "Approve"}
              >
                {c.is_approved ? <X size={16} /> : <Check size={16} />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => { if (confirm("Delete this comment?")) deleteComment.mutate(c.id, { onSuccess: () => toast.success("Deleted") }); }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
        {comments?.length === 0 && <p className="text-muted-foreground font-mono text-sm">No comments yet.</p>}
      </div>
    </div>
  );
}
