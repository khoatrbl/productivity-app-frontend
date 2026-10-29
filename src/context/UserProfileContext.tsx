import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getProfile,
  updateUserProfile,
  addExp as addExpBackend,
  addCoins as addCoinsBackend,
} from "../services/userProfileServices";
import { useAuth } from "./AuthContext";
import { claimDailyQuote } from "../services/quoteServices";
import { claimStartExpReward } from "../services/taskServices";
import type { ProfileDto } from "../types/UserProfile";

interface UserProfileState {
  name: string;
  email: string;
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
  previousLevel: number;
}

interface UserProfileContextValue extends UserProfileState {
  isLoading: boolean;
  error: string | null;
  recentGains: XpGain[];
  clearGain: (id: string) => void;
  recentCoinGains: CoinGain[];
  clearCoinGain: (id: string) => void;
  levelUpEvents: LevelUpEvent[];
  clearLevelUp: (id: string) => void;
  claimQuoteReward: () => Promise<boolean>; // returns whether XP was actually granted
  claimStartTaskReward: (taskId: string) => Promise<boolean>;
  syncCoins: (newCoins: number) => void;
  updateDisplayName: (displayName: string) => Promise<void>;
  applyRewardProfile: (
    profile: ProfileDto,
    gains: { exp: number; coins: number },
  ) => void;
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

const EMPTY_STATE: UserProfileState = {
  name: "",
  email: "",
  subtitle: "",
  level: 1,
  exp: 0,
  maxExp: 100,
  coins: 0,
};
const STATIC_SUBTITLE = "Keep growing!";

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [state, setState] = useState<UserProfileState>(EMPTY_STATE);
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
          email: profile.email,
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

    return () => {
      cancelled = true;
    };
  }, [token]);

  const updateDisplayName = useCallback(async (displayName: string) => {
    const previousName = stateRef.current.name;

    // 1. Optimistic: show it immediately everywhere (Settings + header card)
    setState((prev) => ({ ...prev, name: displayName }));

    try {
      // 2. Reconcile with what the server actually stored (e.g. trimmed/normalized)
      const res = await updateUserProfile(displayName);
      setState((prev) => ({ ...prev, name: res.displayName }));
    } catch (err) {
      // 3. Roll back, then let the caller show the error
      setState((prev) => ({ ...prev, name: previousName }));
      throw err;
    }
  }, []);

  const applyRewardProfile = useCallback(
    (profile: ProfileDto, gains: { exp: number; coins: number }) => {
      const previousLevel = stateRef.current.level;
      const newLevel = profile.currentLevel.level;

      setState((prev) => ({
        ...prev,
        exp: profile.currentExp,
        level: newLevel,
        maxExp: profile.currentLevel.threshold,
        coins: profile.coins,
      }));

      if (gains.exp > 0)
        setRecentGains((prev) => [
          ...prev,
          { id: crypto.randomUUID(), amount: gains.exp },
        ]);
      if (gains.coins > 0)
        setRecentCoinGains((prev) => [
          ...prev,
          { id: crypto.randomUUID(), amount: gains.coins },
        ]);
      if (newLevel > previousLevel) {
        setLevelUpEvents((prev) => [
          ...prev,
          { id: crypto.randomUUID(), newLevel, previousLevel },
        ]);
      }
    },
    [],
  );

  const clearGain = useCallback((id: string) => {
    setRecentGains((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const clearCoinGain = useCallback((id: string) => {
    // NEW
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
      setRecentGains((prev) => [
        ...prev,
        { id: crypto.randomUUID(), amount: expGranted },
      ]);
    }

    return claimed;
  }, []);

  const claimStartTaskReward = useCallback(
    async (taskId: string): Promise<boolean> => {
      const { claimed, expGranted, profile } =
        await claimStartExpReward(taskId);

      if (claimed) {
        setState((prev) => ({
          ...prev,
          exp: profile.currentExp,
          level: profile.currentLevel.level,
          maxExp: profile.currentLevel.threshold,
          coins: profile.coins,
        }));

        setRecentGains((prev) => [
          ...prev,
          { id: crypto.randomUUID(), amount: expGranted },
        ]);
      }

      return claimed;
    },
    [],
  );

  const syncCoins = useCallback((newCoins: number) => {
    const delta = newCoins - stateRef.current.coins;
    setState((prev) => ({ ...prev, coins: newCoins }));
    if (delta !== 0) {
      setRecentCoinGains((prev) => [
        ...prev,
        { id: crypto.randomUUID(), amount: delta },
      ]);
    }
  }, []);

  return (
    <UserProfileContext.Provider
      value={{
        ...state,
        isLoading,
        error,
        claimQuoteReward,
        claimStartTaskReward,
        recentGains,
        clearGain,
        recentCoinGains,
        clearCoinGain,
        levelUpEvents,
        clearLevelUp,
        syncCoins,
        updateDisplayName,
        applyRewardProfile,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfileContext() {
  const ctx = useContext(UserProfileContext);
  if (!ctx)
    throw new Error("useSanctuary must be used within a SanctuaryProvider");
  return ctx;
}
