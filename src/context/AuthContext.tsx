import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { setAccessToken, setAuthHandlers } from "../lib/apiClient";
import { refresh, logout as logoutRequest } from "../services/authServices";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";
interface AuthContextValue {
  token: string | null;
  status: AuthStatus;
  setToken: (token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");

  const setToken = useCallback((next: string) => {
    setAccessToken(next); // apiClient sees it immediately
    setTokenState(next);
    setStatus("authenticated");
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setTokenState(null);
    setStatus("unauthenticated");
  }, []);

  // On app start: try to restore the session from the refresh cookie
  useEffect(() => {
    let cancelled = false;

    refresh()
      .then(({ token }) => {
        if (!cancelled) setToken(token);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      });

    return () => {
      cancelled = true;
    };
  }, [setToken, clearSession]);

  useEffect(() => {
    setAuthHandlers({
      onTokenRefreshed: (newToken) => setTokenState(newToken),
      onSessionExpired: clearSession,
    });
    return () => setAuthHandlers(null);
  }, [clearSession]);

  const logout = useCallback(async () => {
    await logoutRequest(); // server revokes the token + clears the cookie
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ token, status, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
