import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAllPosts, useAllComments, useActivityLogs } from "@/hooks/useBlog";
import { LayoutDashboard, FileText, MessageSquare, Activity, LogOut } from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminPosts from "@/components/admin/AdminPosts";
import AdminComments from "@/components/admin/AdminComments";
import AdminActivityLogs from "@/components/admin/AdminActivityLogs";

type Tab = "dashboard" | "posts" | "comments" | "activity";

export default function AdminPage() {
  const { isAuthenticated, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const navigate = useNavigate();

  const { data: posts } = useAllPosts();
  const { data: comments } = useAllComments();
  const { data: logs } = useActivityLogs();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="font-mono text-muted-foreground">Loading...</p></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { key: "posts", label: "Posts", icon: <FileText size={18} /> },
    { key: "comments", label: "Comments", icon: <MessageSquare size={18} /> },
    { key: "activity", label: "Activity Logs", icon: <Activity size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-7xl">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-primary text-xl">🩺</span>
            <span className="font-mono text-lg font-bold text-foreground">OJT Blog Admin</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors text-muted-foreground text-sm font-mono">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Tab navigation */}
        <nav className="flex gap-1 mb-6 bg-card rounded-lg border border-border p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-colors ${
                activeTab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        {activeTab === "dashboard" && <AdminDashboard posts={posts || []} comments={comments || []} logs={logs || []} />}
        {activeTab === "posts" && <AdminPosts />}
        {activeTab === "comments" && <AdminComments />}
        {activeTab === "activity" && <AdminActivityLogs />}
      </div>
    </div>
  );
}
