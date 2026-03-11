import { usePostById, usePostViewsByDate, useComments } from "@/hooks/useBlog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, MessageSquare, Heart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  postId: string;
  onBack: () => void;
}

export default function PostDashboard({ postId, onBack }: Props) {
  const { data: post } = usePostById(postId);
  const { data: viewData } = usePostViewsByDate(postId);
  const { data: comments } = useComments(postId);

  if (!post) return <p className="text-muted-foreground font-mono">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} className="mr-1" /> Back
        </Button>
        <h2 className="font-mono text-lg font-bold text-foreground truncate">{post.title}</h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <Eye size={20} className="mx-auto text-primary mb-1" />
          <span className="font-mono text-2xl font-bold text-card-foreground">{post.view_count}</span>
          <span className="block text-xs text-muted-foreground font-mono">Views</span>
        </div>
        <div className="stat-card text-center">
          <MessageSquare size={20} className="mx-auto text-primary mb-1" />
          <span className="font-mono text-2xl font-bold text-card-foreground">{post.comment_count}</span>
          <span className="block text-xs text-muted-foreground font-mono">Comments</span>
        </div>
        <div className="stat-card text-center">
          <Heart size={20} className="mx-auto text-primary mb-1" />
          <span className="font-mono text-2xl font-bold text-card-foreground">{post.reaction_count}</span>
          <span className="block text-xs text-muted-foreground font-mono">Reactions</span>
        </div>
      </div>

      {/* Views over time chart */}
      {viewData && viewData.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-mono text-sm font-bold text-card-foreground mb-3">Views Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={viewData}>
              <XAxis dataKey="date" fontSize={10} fontFamily="JetBrains Mono" tick={{ fill: "hsl(215 10% 50%)" }} />
              <YAxis fontSize={10} fontFamily="JetBrains Mono" tick={{ fill: "hsl(215 10% 50%)" }} />
              <Tooltip contentStyle={{ fontFamily: "JetBrains Mono", fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(10 75% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Comments list */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="font-mono text-sm font-bold text-card-foreground mb-3">Comments ({comments?.length || 0})</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {comments?.map((c) => (
            <div key={c.id} className="border-l-2 border-primary/30 pl-3 py-1 text-sm">
              <span className="font-mono font-semibold text-card-foreground">{c.author_name}</span>
              <span className="text-xs text-muted-foreground ml-2">{new Date(c.created_at).toLocaleString()}</span>
              <span className="text-xs text-muted-foreground ml-2">IP: {c.ip_address}</span>
              <p className="text-card-foreground mt-0.5">{c.content}</p>
            </div>
          ))}
          {comments?.length === 0 && <p className="text-muted-foreground text-sm">No comments.</p>}
        </div>
      </div>
    </div>
  );
}
