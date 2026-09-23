import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { getProfile, addExp as addExpBackend, addCoins as addCoinsBackend } from "../services/sanctuaryService";
import { useAuth } from "./AuthContext";
import { claimDailyQuote } from "../services/quoteServices";

interface SanctuaryState {
  name: string;
  subtitle: string;
  avatarUrl?: string;
  level: number;
  exp: number;
  maxExp: number;
  coins: number;
}

interface XpGain {
  id: string;
  amount: number;
}

interface CoinGain {
  id: string;
  amount: number;
}

interface LevelUpEvent {
  id: string;
  newLevel: number;
}

interface SanctuaryContextValue extends SanctuaryState {
  isLoading: boolean;
  error: string | null;
  addExp: (amount: number) => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  recentGains: XpGain[];
  clearGain: (id: string) => void;
  recentCoinGains: CoinGain[]; 
  clearCoinGain: (id: string) => void; 
  levelUpEvents: LevelUpEvent[];
  clearLevelUp: (id: string) => void;
  claimQuoteReward: () => Promise<boolean>; // returns whether XP was actually granted
}

const SanctuaryContext = createContext<SanctuaryContextValue | null>(null);

const EMPTY_STATE: SanctuaryState = { name: "", subtitle: "", level: 1, exp: 0, maxExp: 100, coins: 0 };
const STATIC_SUBTITLE = "Keep growing!";

export function SanctuaryProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [state, setState] = useState<SanctuaryState>(EMPTY_STATE);
  const [recentGains, setRecentGains] = useState<XpGain[]>([]);
  const [recentCoinGains, setRecentCoinGains] = useState<CoinGain[]>([]);
  const [levelUpEvents, setLevelUpEvents] = useState<LevelUpEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mirrors `state` on every render so addExp can read the *current* level
  // synchronously, without needing state in its own dependency array.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
          avatarUrl: undefined,
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

  const addExp = useCallback(async (amount: number) => {
    const previousLevel = stateRef.current.level;
    const result = await addExpBackend(amount);
    const newLevel = result.currentLevel.level;

    setState((prev) => ({
      ...prev,
      exp: result.currentExp,
      level: newLevel,
      maxExp: result.currentLevel.threshold,
    }));

    setRecentGains((prev) => [...prev, { id: crypto.randomUUID(), amount }]);

    // Backend is the single source of truth for whether a level-up actually
    // happened — this also correctly handles jumping multiple levels in one
    // grant (still just one celebration, for the final level reached).
    if (newLevel > previousLevel) {
      setLevelUpEvents((prev) => [...prev, { id: crypto.randomUUID(), newLevel }]);
    }
  }, []);

  const addCoins = useCallback(async (amount: number) => {
    const result = await addCoinsBackend(amount);
    setState((prev) => ({ ...prev, coins: result.currentCoins }));
    setRecentCoinGains((prev) => [...prev, { id: crypto.randomUUID(), amount }]);
  }, []);

  const clearGain = useCallback((id: string) => {
    setRecentGains((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const clearCoinGain = useCallback((id: string) => { // NEW
    setRecentCoinGains((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const clearLevelUp = useCallback((id: string) => {
    setLevelUpEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const claimQuoteReward = useCallback(async (): Promise<boolean> => {
    const { claimed, expGranted, profile } = await claimDailyQuote();

    if (claimed) {
      setState((prev) => ({
        ...prev,
        exp: profile.currentExp,
        level: profile.currentLevel.level,
        maxExp: profile.currentLevel.threshold,
        coins: profile.coins,
      }));
      setRecentGains((prev) => [...prev, { id: crypto.randomUUID(), amount: expGranted }]); 
    }

    return claimed;
  }, []);

  return (
    <SanctuaryContext.Provider
      value={{ ...state, isLoading, error, addExp, addCoins, claimQuoteReward, recentGains, clearGain, recentCoinGains, clearCoinGain, levelUpEvents, clearLevelUp }}
    >
      {children}
    </SanctuaryContext.Provider>
  );
}

export function useSanctuary() {
  const ctx = useContext(SanctuaryContext);
  if (!ctx) throw new Error("useSanctuary must be used within a SanctuaryProvider");
  return ctx;
}