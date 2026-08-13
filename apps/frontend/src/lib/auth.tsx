import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, clearToken, hasToken, saveToken } from "./api";
import type { User } from "./types";

const AuthContext = createContext<null | {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasToken()) {
      setLoading(false);
      return;
    }

    api.get("/api/v1/me")
      .then((response) => setUser(response.data.user))
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async signIn(username: string, password: string) {
      const response = await api.post("/api/v1/signin", { username, password });
      saveToken(response.data.token);
      setUser(response.data.user);
    },
    async signUp(username: string, password: string) {
      const response = await api.post("/api/v1/signup", { username, password });
      saveToken(response.data.token);
      setUser(response.data.user);
    },
    signOut() {
      clearToken();
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
