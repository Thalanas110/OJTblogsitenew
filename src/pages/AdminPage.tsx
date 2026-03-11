import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAllPosts, useAllComments, useActivityLogs } from "@/hooks/useBlog";
import { LayoutDashboard, FileText, MessageSquare, Activity, LogOut, Menu, X } from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminPosts from "@/components/admin/AdminPosts";
import AdminComments from "@/components/admin/AdminComments";
import AdminActivityLogs from "@/components/admin/AdminActivityLogs";

type Tab = "dashboard" | "posts" | "comments" | "activity";

export default function AdminPage() {
  const { isAuthenticated, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const handleTabChange = (key: Tab) => {
    setActiveTab(key);
    setSidebarOpen(false);
  };

  const SidebarNav = () => (
    <nav className="flex flex-col gap-1 p-3">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => handleTabChange(t.key)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-mono text-sm transition-colors text-left w-full ${
            activeTab === t.key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}
      <div className="mt-4 pt-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md font-mono text-sm transition-colors text-left w-full text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen blog-bg flex flex-col">
      <div className="min-h-screen blog-bg-overlay flex flex-col">
      {/* Top bar */}
      <header className="bg-card border-b border-border sticky top-0 z-50 h-14">
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors text-foreground"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-primary text-xl">🩺</span>
            <span className="font-mono text-base md:text-lg font-bold text-foreground leading-tight">
              For Prof. Loudel M. Manaloto, MSCS
            </span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-200
            md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:overflow-y-auto md:translate-x-0 md:flex md:w-56 md:shrink-0 md:self-start
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border md:hidden">
            <span className="font-mono text-sm font-semibold text-foreground">Admin Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
          <SidebarNav />
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 py-6 min-w-0">
          {activeTab === "dashboard" && <AdminDashboard posts={posts || []} comments={comments || []} logs={logs || []} />}
          {activeTab === "posts" && <AdminPosts />}
          {activeTab === "comments" && <AdminComments />}
          {activeTab === "activity" && <AdminActivityLogs />}
        </main>
      </div>
      </div>
    </div>
  );
}
