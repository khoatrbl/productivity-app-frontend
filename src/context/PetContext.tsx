import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getMyPet, updatePetName as updatePetNameBackend } from "../services/petServices";
import type { PetDto } from "../types/PetDto";
import { useAuth } from "./AuthContext";

interface PetContextValue {
  pet: PetDto | null; // null only while still loading, never after
  isLoading: boolean;
  error: string | null;
  renamePet: (name: string) => Promise<void>;
}

const PetContext = createContext<PetContextValue | null>(null);

export function PetProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [pet, setPet] = useState<PetDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setIsLoading(true);

    getMyPet()
      .then((data) => {
        if (!cancelled) {
          setPet(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Couldn't load your companion");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  const renamePet = useCallback(async (name: string) => {
    const updated = await updatePetNameBackend(name);
    setPet(updated);
  }, []);

  return (
    <PetContext.Provider value={{ pet, isLoading, error, renamePet }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error("usePet must be used within a PetProvider");
  return ctx;
}