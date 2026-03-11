import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import BlogHeader from "@/components/BlogHeader";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in!");
      navigate("/admin");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen blog-bg">
      <div className="min-h-screen blog-bg-overlay">
        <BlogHeader />
        <main className="container mx-auto px-4 py-20 max-w-sm">
          <div className="bg-card rounded-lg border border-border p-8">
            <h1 className="font-mono text-xl font-bold text-card-foreground mb-6 text-center">
              Admin Login
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-mono text-sm"
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-mono text-sm"
                required
              />
              <Button type="submit" disabled={loading} className="w-full font-mono">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
