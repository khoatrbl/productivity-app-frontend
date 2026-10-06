import { useCallback, useEffect, useRef, useState } from "react";
import { petPet } from "../services/petServices";
import { usePet } from "../context/PetContext";
import { ApiError } from "../lib/apiClient";
import type { PetDto, PetItemDto } from "../types/PetDto";

const MAX_AFFECTION = 100;

export type PetResult =
  | { ok: true; gained: number }
  | { ok: false; reason: "napping" | "maxed" | "busy" | "error"; message?: string };

export function usePetCare(pet: PetDto | null) {
  const { syncPet } = usePet();
  const [items, setItems] = useState<PetItemDto[]>(pet?.items ?? []);
  const [now, setNow] = useState(Date.now());
  const inFlight = useRef(false);

  useEffect(() => {
    if (pet) setItems(pet.items ?? []);
  }, [pet]);

  const cooldownUntilMs = pet?.petCooldownUntil ? new Date(pet.petCooldownUntil).getTime() : null;
  const cooldownMsLeft = cooldownUntilMs ? Math.max(0, cooldownUntilMs - now) : 0;
  const isNapping = cooldownMsLeft > 0;

  // Tick once a second while napping
  useEffect(() => {
    if (!cooldownUntilMs) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [cooldownUntilMs]);

  const affection = pet?.petCurrentAffectionPoint ?? 0;
  const isAffectionMaxed = affection >= MAX_AFFECTION;
  // When a nap has just ended, the server refills on the next request; show 5 meanwhile
  const petsLeft = cooldownUntilMs && !isNapping ? 5 : pet?.pettingsLeft ?? 0;
  const canPet = !!pet && !isNapping && !isAffectionMaxed && petsLeft > 0;

  const petTheCapy = useCallback(async (): Promise<PetResult> => {
    if (inFlight.current) return { ok: false, reason: "busy" };
    if (!canPet) return { ok: false, reason: isNapping ? "napping" : "maxed" };

    inFlight.current = true;
    const before = affection;
    try {
      const updated = await petPet();
      syncPet(updated);
      return { ok: true, gained: updated.petCurrentAffectionPoint - before };
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Couldn't pet right now", 0);
      if (apiErr.status === 429) return { ok: false, reason: "napping" };
      if (apiErr.status === 409) return { ok: false, reason: "maxed" };
      return { ok: false, reason: "error", message: apiErr.message };
    } finally {
      inFlight.current = false;
    }
  }, [canPet, isNapping, affection, syncPet]);

  const toggleEquip = useCallback((petItemId: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === petItemId);
      if (!target) return prev;
      const type = target.shopItem.itemType;
      const willEquip = !target.isEquipped;
      return prev.map((i) => {
        if (i.id === petItemId) return { ...i, isEquipped: willEquip };
        if (willEquip && i.shopItem.itemType === type) return { ...i, isEquipped: false };
        return i;
      });
    });
  }, []);

  return {
    level: pet?.petLevel.level ?? 1,
    exp: pet?.petCurrentExp ?? 0,
    maxExp: pet?.petLevel.threshold ?? 100,
    affection,
    items,
    petsLeft,
    cooldownMsLeft,
    canPet,
    isAffectionMaxed,
    pet: petTheCapy,
    toggleEquip,
  };
}