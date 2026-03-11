import type { PostWithStats } from "@/types/blog";
import type { Comment, ActivityLog } from "@/types/blog";
import { Eye, MessageSquare, Heart, FileText } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useAllViewsByDate } from "@/hooks/useBlog";

interface Props {
  posts: PostWithStats[];
  comments: (Comment & { post_title?: string })[];
  logs: ActivityLog[];
}

export default function AdminDashboard({ posts, comments, logs }: Props) {
  const { data: dailyVisits = [] } = useAllViewsByDate();
  const totalViews = posts.reduce((s, p) => s + (p.view_count || 0), 0);
  const totalComments = comments.length;
  const totalReactions = posts.reduce((s, p) => s + (p.reaction_count || 0), 0);

  const stats = [
    { label: "Total Posts", value: posts.length, icon: <FileText size={20} /> },
    { label: "Total Views", value: totalViews, icon: <Eye size={20} /> },
    { label: "Total Comments", value: totalComments, icon: <MessageSquare size={20} /> },
    { label: "Total Reactions", value: totalReactions, icon: <Heart size={20} /> },
  ];

  const topPosts = [...posts]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 5)
    .map((p) => ({
      name: p.title.length > 18 ? p.title.slice(0, 18) + "…" : p.title,
      Views: p.view_count || 0,
      isVideo: !!p.youtube_url,
    }));

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

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-mono text-sm font-bold text-card-foreground mb-4 text-center">
            Most Read Posts vs Most Watched Videos
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topPosts} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "monospace" }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--card-foreground))",
                  fontFamily: "monospace",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="Views" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-mono text-sm font-bold text-card-foreground mb-4 text-center">
            Daily Visits (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyVisits} margin={{ top: 5, right: 10, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "monospace" }}
                tickFormatter={(d: string) => d.slice(5)}
              />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--card-foreground))",
                  fontFamily: "monospace",
                  fontSize: 12,
                }}
                labelFormatter={(l: string) => `Date: ${l}`}
              />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: "monospace" }} />
              <Line
                type="monotone"
                dataKey="count"
                name="Daily Visits"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
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
