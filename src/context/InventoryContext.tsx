import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getInventory } from "../services/inventoryServices";
import type { InventoryItemDto } from "../types/InventoryItemDto";

interface InventoryContextValue {
  items: InventoryItemDto[]; // sorted cheapest → most effective
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  upsertItem: (item: InventoryItemDto) => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

function sortByPrice(items: InventoryItemDto[]) {
  return [...items].sort((a, b) => a.treatDto.price - b.treatDto.price);
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<InventoryItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getInventory();
      setItems(sortByPrice(data));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your pantry");
    }
  }, []);

  const upsertItem = useCallback((updated: InventoryItemDto) => {
    setItems((prev) => {
        const exists = prev.some((i) => i.treatDto.id === updated.treatDto.id);
        const next = exists
        ? prev.map((i) => (i.treatDto.id === updated.treatDto.id ? updated : i))
        : [...prev, updated];
        return sortByPrice(next);
    });
  }, []);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    refresh().finally(() => setIsLoading(false));
  }, [token, refresh]);

  return (
    <InventoryContext.Provider value={{ items, isLoading, error, refresh, upsertItem }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within an InventoryProvider");
  return ctx;
}