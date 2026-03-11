import { useRef } from "react";
import {
  usePostById, usePostViewsByDate, useComments,
  useVideoPlayCount, useHourlyViewDistribution,
  usePostViewsDetails, useRecentVideoPlays,
} from "@/hooks/useBlog";
import { X, FileDown, Eye, Play, MessageSquare, Calendar } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface Props {
  postId: string;
  onBack: () => void;
}

function parseBrowser(ua: string | null): string {
  if (!ua) return "Unknown";
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
}

function maskIp(ip: string): string {
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.***`;
  return ip.length > 6 ? ip.slice(0, 6) + "***" : ip;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const BROWSER_COLORS: Record<string, string> = {
  Chrome: "#ef4444",
  Firefox: "#f97316",
  Safari: "#eab308",
  Edge: "#3b82f6",
  Opera: "#a855f7",
  Other: "#6b7280",
  Unknown: "#9ca3af",
};

export default function PostDashboard({ postId, onBack }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const { data: post } = usePostById(postId);
  const { data: viewData = [] } = usePostViewsByDate(postId);
  const { data: comments = [] } = useComments(postId);
  const { data: videoPlayCount = 0 } = useVideoPlayCount(postId);
  const { data: hourlyData = [] } = useHourlyViewDistribution(postId);
  const { data: viewsDetails = [] } = usePostViewsDetails(postId);
  const { data: recentPlays = [] } = useRecentVideoPlays(postId);

  if (!post) return <p className="text-muted-foreground font-mono">Loading...</p>;

  const daysOld = Math.floor(
    (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  const browserCounts: Record<string, number> = {};
  viewsDetails.forEach((v) => {
    const b = parseBrowser(v.user_agent);
    browserCounts[b] = (browserCounts[b] || 0) + 1;
  });
  const browserData = Object.entries(browserCounts).map(([name, value]) => ({ name, value }));

  const handleExportPdf = () => window.print();

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .post-stat-print { display: block !important; }
        }
      `}</style>

      <div ref={printRef} className="post-stat-print space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
          <h2 className="font-mono text-sm font-bold text-primary truncate flex-1 min-w-0">
            Statistics: {post.title}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold px-3 py-1.5 rounded transition-colors"
            >
              <FileDown size={13} /> EXPORT PDF
            </button>
            <button
              onClick={onBack}
              className="p-1.5 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
              aria-label="Back"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className={`grid gap-4 ${post.youtube_url ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3"}`}>
          <div className="stat-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
              <Eye size={18} className="text-violet-400" />
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-card-foreground">{post.view_count}</p>
              <p className="font-mono text-xs text-muted-foreground">Total Views</p>
            </div>
          </div>

          {post.youtube_url && (
            <div className="stat-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center shrink-0">
                <Play size={18} className="text-pink-400" />
              </div>
              <div>
                <p className="font-mono text-xl font-bold text-card-foreground">{videoPlayCount}</p>
                <p className="font-mono text-xs text-muted-foreground">Video Plays</p>
              </div>
            </div>
          )}

          <div className="stat-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
              <MessageSquare size={18} className="text-cyan-400" />
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-card-foreground">{comments.length}</p>
              <p className="font-mono text-xs text-muted-foreground">Comments</p>
            </div>
          </div>

          <div className="stat-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-green-400" />
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-card-foreground">{daysOld}</p>
              <p className="font-mono text-xs text-muted-foreground">Days Old</p>
            </div>
          </div>
        </div>

        {/* Charts: Daily Views + Hourly Distribution */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-mono text-sm font-bold text-primary mb-4 text-center">
              Daily Views (Last 30 Days)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={viewData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "monospace" }}
                  tickFormatter={(d: string) => d.slice(5)}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-mono text-sm font-bold text-primary mb-4 text-center">
              Hourly View Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "monospace" }}
                  interval={1}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="#22c55e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Browser Stats + Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-mono text-sm font-bold text-primary mb-4 text-center">
              Browser Statistics
            </h3>
            {browserData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={browserData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                  >
                    {browserData.map((entry) => (
                      <Cell key={entry.name} fill={BROWSER_COLORS[entry.name] ?? "#6b7280"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="font-mono text-xs text-card-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm font-mono text-center py-10">
                No browser data yet.
              </p>
            )}
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-mono text-sm font-bold text-card-foreground mb-3">Recent Activity</h3>
            <div className="space-y-3 max-h-[240px] overflow-y-auto">
              {recentPlays.map((play) => (
                <div key={play.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Play size={13} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold text-card-foreground">Video played</p>
                    <p className="font-mono text-xs text-primary">{timeAgo(play.created_at)}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {parseBrowser(play.user_agent)} &bull; {maskIp(play.ip_address)}
                    </p>
                  </div>
                </div>
              ))}
              {recentPlays.length === 0 && (
                <p className="text-muted-foreground text-sm font-mono">No video plays recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

