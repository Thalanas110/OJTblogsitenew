import type { PostWithStats } from "@/types/blog";
import type { Comment, ActivityLog } from "@/types/blog";
import { Eye, MessageSquare, Heart, FileText } from "lucide-react";

interface Props {
  posts: PostWithStats[];
  comments: (Comment & { post_title?: string })[];
  logs: ActivityLog[];
}

export default function AdminDashboard({ posts, comments, logs }: Props) {
  const totalViews = posts.reduce((s, p) => s + (p.view_count || 0), 0);
  const totalComments = comments.length;
  const totalReactions = posts.reduce((s, p) => s + (p.reaction_count || 0), 0);

  const stats = [
    { label: "Total Posts", value: posts.length, icon: <FileText size={20} /> },
    { label: "Total Views", value: totalViews, icon: <Eye size={20} /> },
    { label: "Total Comments", value: totalComments, icon: <MessageSquare size={20} /> },
    { label: "Total Reactions", value: totalReactions, icon: <Heart size={20} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card flex flex-col items-center text-center">
            <div className="text-primary mb-2">{s.icon}</div>
            <span className="font-mono text-2xl font-bold text-card-foreground">{s.value}</span>
            <span className="text-xs text-muted-foreground font-mono">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-mono text-sm font-bold text-card-foreground mb-3">Recent Comments</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {comments.slice(0, 10).map((c) => (
              <div key={c.id} className="text-sm border-l-2 border-primary/30 pl-3 py-1">
                <span className="font-mono font-semibold text-card-foreground">{c.author_name}</span>
                <span className="text-muted-foreground"> on </span>
                <span className="text-card-foreground">{c.post_title}</span>
                <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{c.content}</p>
              </div>
            ))}
            {comments.length === 0 && <p className="text-muted-foreground text-sm">No comments yet.</p>}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-mono text-sm font-bold text-card-foreground mb-3">Recent Activity</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.slice(0, 10).map((l) => (
              <div key={l.id} className="text-sm py-1 border-b border-border last:border-0">
                <span className="font-mono text-primary font-semibold">{l.action}</span>
                <span className="text-muted-foreground"> {l.entity_type}</span>
                <span className="text-xs text-muted-foreground block">{new Date(l.created_at).toLocaleString()}</span>
              </div>
            ))}
            {logs.length === 0 && <p className="text-muted-foreground text-sm">No activity yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
