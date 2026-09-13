import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface SanctuaryState {
  level: number;
  xp: number;
  maxXp: number;
  coins: number;
}

interface XpGain {
  id: string;
  amount: number;
}

interface SanctuaryContextValue extends SanctuaryState {
  addExp: (amount: number) => void;
  recentGains: XpGain[];
  clearGain: (id: string) => void;
}

const SanctuaryContext = createContext<SanctuaryContextValue | null>(null);

export function SanctuaryProvider({ children, initial }: { children: ReactNode; initial: SanctuaryState }) {
  const [state, setState] = useState(initial);
  const [recentGains, setRecentGains] = useState<XpGain[]>([]);

  const addExp = useCallback((amount: number) => {
    setState((prev) => {
      let { xp, level, maxXp } = prev;
      xp += amount;

      // Handles multiple level-ups from one big XP grant, not just one
      while (xp >= maxXp) {
        xp -= maxXp;
        level += 1;
        maxXp = Math.round(maxXp * 1.15); // simple scaling curve — tune freely
      }

      return { ...prev, xp, level, maxXp };
    });

    setRecentGains((prev) => [...prev, { id: crypto.randomUUID(), amount }]);
  }, []);

  const clearGain = useCallback((id: string) => {
    setRecentGains((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return (
    <SanctuaryContext.Provider value={{ ...state, addExp, recentGains, clearGain }}>
      {children}
    </SanctuaryContext.Provider>
  );
}

export function useSanctuary() {
  const ctx = useContext(SanctuaryContext);
  if (!ctx) throw new Error("useSanctuary must be used within a SanctuaryProvider");
  return ctx;
}