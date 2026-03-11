import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully!");
      navigate("/admin");
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen blog-bg flex items-center justify-center">
      <div className="min-h-screen blog-bg-overlay w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl border border-border shadow-2xl overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-orange-400 to-primary" />

            <div className="p-8 sm:p-10">
              {/* Header */}
              <div className="flex flex-col items-center mb-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-card-foreground tracking-tight">
                  Welcome back
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Sign in to your admin account
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-10 bg-background/60 border-border focus:border-primary transition-colors"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-card-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-10 bg-background/60 border-border focus:border-primary transition-colors"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 font-semibold mt-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              {/* Footer */}
              <p className="text-center text-xs text-muted-foreground mt-6">
                Admin access only &mdash; unauthorized attempts are logged.
              </p>
            </div>
          </div>

          {/* Back link */}
          <p className="text-center text-sm text-muted-foreground/80 mt-5">
            <a href="/" className="hover:text-foreground underline underline-offset-4 transition-colors">
              &larr; Back to blog
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
