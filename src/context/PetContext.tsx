import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getMyPet,
  updatePetName as updatePetNameBackend,
} from "../services/petServices";
import type { PetDto, PetItemDto } from "../types/PetDto";
import { useAuth } from "./AuthContext";

interface PetContextValue {
  pet: PetDto | null; // null only while still loading, never after
  isLoading: boolean;
  error: string | null;
  renamePet: (name: string) => Promise<void>;
  syncPet: (pet: PetDto) => void;
  addPetItem: (item: PetItemDto) => void;
  refreshPet: () => Promise<void>;
  updatePet: (fn: (prev: PetDto) => PetDto) => void;
  pendingDecay: number | null;
  clearPendingDecay: () => void;
}

const PetContext = createContext<PetContextValue | null>(null);

export function PetProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [pet, setPet] = useState<PetDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Affection lost while away, waiting to be shown. Kept apart from `pet`
  // so a later fetch or sync (which returns null) can't wipe it.
  const [pendingDecay, setPendingDecay] = useState<number | null>(null);

  // The server settles decay only ONCE (on the first load after being away).
  // Whichever response carries it, remember it — never overwrite with null.
  const rememberDecay = useCallback((data: PetDto) => {
    const lost = data.affectionLostSinceLastVisit;
    if (lost && lost > 0) setPendingDecay(lost);
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setIsLoading(true);

    getMyPet()
      .then((data) => {
        // Even a cancelled request (StrictMode's first run) already settled
        // the decay on the server, so its announcement must not be lost.
        rememberDecay(data);
        if (cancelled) return;
        setPet(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Couldn't load your companion");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, rememberDecay]);

  const clearPendingDecay = useCallback(() => setPendingDecay(null), []);

  const renamePet = useCallback(async (name: string) => {
    const updated = await updatePetNameBackend(name);
    setPet(updated);
  }, []);

  const syncPet = useCallback((next: PetDto) => setPet(next), []);

  const addPetItem = useCallback((item: PetItemDto) => {
    setPet((prev) =>
      prev
        ? {
            ...prev,
            items: [
              ...(prev.items ?? []).filter((i) => i.id !== item.id),
              item,
            ],
          }
        : prev,
    );
  }, []);

  const refreshPet = useCallback(async () => {
    try {
      const data = await getMyPet();
      rememberDecay(data); // a refresh can settle decay too (e.g. first load of the day)
      setPet(data);
    } catch (err) {
      console.error("Couldn't refresh pet:", err);
    }
  }, [rememberDecay]);

  /** Changes the shared pet from its previous value (no-op while the pet is still loading). */
  const updatePet = useCallback((fn: (prev: PetDto) => PetDto) => {
    setPet((prev) => (prev ? fn(prev) : prev));
  }, []);

  return (
    <PetContext.Provider
      value={{
        pet,
        isLoading,
        error,
        renamePet,
        syncPet,
        addPetItem,
        refreshPet,
        updatePet,
        pendingDecay,
        clearPendingDecay,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error("usePet must be used within a PetProvider");
  return ctx;
}
