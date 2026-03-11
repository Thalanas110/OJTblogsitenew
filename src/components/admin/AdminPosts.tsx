import { useState } from "react";
import { useAllPosts, useDeletePost, useTogglePin, useCreatePost, useUpdatePost } from "@/hooks/useBlog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pin, PinOff, Trash2, Edit, Plus, Eye, MessageSquare, Heart, BarChart3, X } from "lucide-react";
import PostDashboard from "@/components/admin/PostDashboard";

export default function AdminPosts() {
  const { data: posts, isLoading } = useAllPosts();
  const deletePost = useDeletePost();
  const togglePin = useTogglePin();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewDashboard, setViewDashboard] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", excerpt: "", cover_image_url: "", is_published: true });

  const resetForm = () => {
    setForm({ title: "", content: "", excerpt: "", cover_image_url: "", is_published: true });
    setShowCreate(false);
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error("Title and content required"); return; }
    createPost.mutate(
      { title: form.title, content: form.content, excerpt: form.excerpt || form.content.slice(0, 150), cover_image_url: form.cover_image_url || undefined, is_published: form.is_published },
      { onSuccess: () => { resetForm(); toast.success("Post created!"); }, onError: () => toast.error("Failed") }
    );
  };

  const handleUpdate = () => {
    if (!editingId) return;
    updatePost.mutate(
      { id: editingId, updates: { title: form.title, content: form.content, excerpt: form.excerpt, cover_image_url: form.cover_image_url || null, is_published: form.is_published } },
      { onSuccess: () => { resetForm(); toast.success("Post updated!"); }, onError: () => toast.error("Failed") }
    );
  };

  const startEdit = (post: { id: string; title: string; content: string; excerpt: string; cover_image_url: string | null; is_published: boolean }) => {
    setEditingId(post.id);
    setForm({ title: post.title, content: post.content, excerpt: post.excerpt, cover_image_url: post.cover_image_url || "", is_published: post.is_published });
    setShowCreate(false);
  };

  if (viewDashboard) {
    return <PostDashboard postId={viewDashboard} onBack={() => setViewDashboard(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-lg font-bold text-foreground">Posts ({posts?.length || 0})</h2>
        <Button onClick={() => { resetForm(); setShowCreate(true); }} className="font-mono text-sm" size="sm">
          <Plus size={16} className="mr-1" /> New Post
        </Button>
      </div>

      {(showCreate || editingId) && (
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono font-bold text-card-foreground">{editingId ? "Edit Post" : "New Post"}</h3>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="font-mono text-sm" />
          <Input placeholder="Cover image URL (optional)" value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} className="font-mono text-sm" />
          <Textarea placeholder="Excerpt (short preview)" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="font-mono text-sm" />
          <Textarea placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} className="font-mono text-sm" />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 font-mono text-sm text-card-foreground">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
              Published
            </label>
            <Button onClick={editingId ? handleUpdate : handleCreate} disabled={createPost.isPending || updatePost.isPending} className="font-mono text-sm">
              {editingId ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground font-mono text-sm">Loading...</p>
      ) : (
        <div className="space-y-2">
          {posts?.map((p) => (
            <div key={p.id} className="bg-card rounded-lg border border-border p-4 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {p.is_pinned && <Pin size={14} className="text-primary flex-shrink-0" />}
                  <h3 className="font-mono text-sm font-bold text-card-foreground truncate">{p.title}</h3>
                  {!p.is_published && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded font-mono">Draft</span>}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>{new Date(p.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Eye size={12} /> {p.view_count}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={12} /> {p.comment_count}</span>
                  <span className="flex items-center gap-1"><Heart size={12} /> {p.reaction_count}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setViewDashboard(p.id)} title="Stats">
                  <BarChart3 size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => startEdit(p)} title="Edit">
                  <Edit size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => togglePin.mutate({ id: p.id, isPinned: p.is_pinned })} title={p.is_pinned ? "Unpin" : "Pin"}>
                  {p.is_pinned ? <PinOff size={16} /> : <Pin size={16} />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete this post?")) deletePost.mutate(p.id); }} className="text-destructive" title="Delete">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
