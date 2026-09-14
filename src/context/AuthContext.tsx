import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("capydo_token"));

  function setToken(newToken: string) {
    localStorage.setItem("capydo_token", newToken);
    setTokenState(newToken);
  }

  function logout() {
    localStorage.removeItem("capydo_token");
    setTokenState(null);
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}