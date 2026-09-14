import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getProfile } from "../services/sanctuaryService";
import { useAuth } from "./AuthContext";
import mockAvatar from '../assets/heize.jpg';

interface SanctuaryState {
  name: string;
  subtitle: string;
  avatarUrl?: string; // not provided by the backend yet — always undefined for now
  level: number;
  exp: number;
  maxExp: number;
  coins: number;
}

interface XpGain {
  id: string;
  amount: number;
}

interface SanctuaryContextValue extends SanctuaryState {
  isLoading: boolean;
  error: string | null;
  addExp: (amount: number) => void;
  recentGains: XpGain[];
  clearGain: (id: string) => void;
}

const SanctuaryContext = createContext<SanctuaryContextValue | null>(null);

const EMPTY_STATE: SanctuaryState = { name: "", subtitle: "", level: 1, exp: 0, maxExp: 100, coins: 0 };
const STATIC_SUBTITLE = "Keep growing!"; // design copy, not backend data

export function SanctuaryProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [state, setState] = useState<SanctuaryState>(EMPTY_STATE);
  const [recentGains, setRecentGains] = useState<XpGain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setIsLoading(true);

    getProfile()
    .then((profile) => {
        if (cancelled) return;

        setState({
            name: profile.displayName,
            subtitle: STATIC_SUBTITLE,
            avatarUrl: "../assets/heize.jpg",
            level: profile.currentLevel.level,
            exp: profile.currentExp,
            maxExp: profile.currentLevel.threshold,
            coins: profile.coins,
        });

        setError(null);
    })
    .catch((err) => {
        if (!cancelled) setError(err.message ?? "Couldn't load your sanctuary");
    })
    .finally(() => {
        if (!cancelled) setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [token]);

  const addExp = useCallback((amount: number) => {
    setState((prev) => {
      let { exp, level, maxExp } = prev;
      exp += amount;
      while (exp >= maxExp) {
        exp -= maxExp;
        level += 1;
        maxExp = Math.round(maxExp * 1.15);
      }
      return { ...prev, exp, level, maxExp };
    });
    setRecentGains((prev) => [...prev, { id: crypto.randomUUID(), amount }]);
  }, []);

  const clearGain = useCallback((id: string) => {
    setRecentGains((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return (
    <SanctuaryContext.Provider value={{ ...state, isLoading, error, addExp, recentGains, clearGain }}>
      {children}
    </SanctuaryContext.Provider>
  );
}

export function useSanctuary() {
  const ctx = useContext(SanctuaryContext);
  if (!ctx) throw new Error("useSanctuary must be used within a SanctuaryProvider");
  return ctx;
}