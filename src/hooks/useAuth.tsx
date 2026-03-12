import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { getSession, onAuthChange, signIn, signOut } from "@/lib/api";

interface AuthCtx {
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    const MIN_LOADING_TIME = 800; // Minimum time to show loading screen (ms)

    getSession().then((s) => {
      setIsAuthenticated(!!s);
      
      // Ensure loading screen shows for at least MIN_LOADING_TIME
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
      
      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    });

    const { data } = onAuthChange((session) => {
      setIsAuthenticated(!!session);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signIn(email, password);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await signOut();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
