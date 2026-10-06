import { useCallback, useEffect, useRef, useState } from "react";
import { petPet, updatePetItemState } from "../services/petServices";
import { usePet } from "../context/PetContext";
import { ApiError } from "../lib/apiClient";
import type { PetDto, PetItemDto } from "../types/PetDto";

const MAX_AFFECTION = 100;

export type PetResult =
  | { ok: true; gained: number }
  | { ok: false; reason: "napping" | "maxed" | "busy" | "error"; message?: string };

export type EquipResult =
  | { ok: true }
  | { ok: false; reason: "busy" | "not_found" | "network" | "error"; message?: string };

export function usePetCare(pet: PetDto | null) {
  const { syncPet, refreshPet } = usePet();
  const [items, setItems] = useState<PetItemDto[]>(pet?.items ?? []);
  const [now, setNow] = useState(Date.now());
  const [equippingId, setEquippingId] = useState<string | null>(null);

  const petInFlight = useRef(false);
  const equipInFlight = useRef(false);

  // Keep the local wardrobe in sync with the server's pet
  useEffect(() => {
    if (pet) setItems(pet.items ?? []);
  }, [pet]);

  // ---------- Petting ----------

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
    if (petInFlight.current) return { ok: false, reason: "busy" };
    if (!canPet) return { ok: false, reason: isNapping ? "napping" : "maxed" };

    petInFlight.current = true;
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
      petInFlight.current = false;
    }
  }, [canPet, isNapping, affection, syncPet]);

  // ---------- Wardrobe ----------

  const toggleEquip = useCallback(async (petItemId: string): Promise<EquipResult> => {
  if (equipInFlight.current) return { ok: false, reason: "busy" };

    const target = items.find((i) => i.id === petItemId);
    if (!target) {
      await refreshPet();
      return { ok: false, reason: "not_found", message: "That item isn't available anymore." };
    }

    // Decide the desired state once; send it and mirror it locally
    const willEquip = !target.isEquipped;
    const type = target.shopItem.itemType;

    equipInFlight.current = true;
    setEquippingId(petItemId);

    try {
      await updatePetItemState(petItemId, willEquip);

      // Mirror the server rule: one equipped item per itemType
      setItems((prev) =>
        prev.map((i) => {
          if (i.id === petItemId) return { ...i, isEquipped: willEquip };
          if (willEquip && i.shopItem.itemType === type) return { ...i, isEquipped: false };
          return i;
        })
      );

      return { ok: true };
    } catch (error) {
      const apiError =
        error instanceof ApiError ? error : new ApiError("Couldn't equip/unequip pet item.", 0);

      if (apiError.status === 404) {
        // Our copy is stale (item, pet or user no longer exists on the server): resync
        await refreshPet();
        return { ok: false, reason: "not_found", message: "That item isn't available anymore." };
      }

      if (apiError.status === 0) {
        return { ok: false, reason: "network", message: "Couldn't reach the server. Try again." };
      }

      console.error("Equip failed:", apiError);
      return {
        ok: false,
        reason: "error",
        message: apiError.message || "Couldn't update your capy's outfit.",
      };
    } finally {
      equipInFlight.current = false;
      setEquippingId(null);
    }
  }, [items, refreshPet]);

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
    equippingId,
  };
}