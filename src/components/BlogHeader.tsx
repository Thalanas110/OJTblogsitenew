import { Link } from "react-router-dom";
import { Menu, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

export default function BlogHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-6xl">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-primary text-2xl">🩺</span>
          <h1 className="font-mono text-lg md:text-xl font-bold text-foreground tracking-tight">
            OJT Blog
          </h1>
        </Link>

        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            className="p-2 rounded-md hover:bg-accent transition-colors text-foreground"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md hover:bg-accent transition-colors text-foreground"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-border bg-card">
          <div className="container mx-auto px-4 py-2 max-w-6xl flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-accent transition-colors font-mono text-sm text-foreground"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-accent transition-colors font-mono text-sm text-foreground"
            >
              About
            </Link>
            {isAuthenticated && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-accent transition-colors font-mono text-sm text-foreground"
              >
                Admin
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-accent transition-colors font-mono text-sm text-foreground"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
