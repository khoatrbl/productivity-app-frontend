import { useCallback, useEffect, useRef, useState } from "react";
import { petPet, updatePetItemState } from "../services/petServices";
import { usePet } from "../context/PetContext";
import { ApiError } from "../lib/apiClient";
import type { PetDto, PetItemDto } from "../types/PetDto";

const MAX_AFFECTION = 100;
const PETTINGS_PER_WINDOW = 5; // must match the backend
const PET_COOLDOWN_MS = 60 * 60 * 1000; // must match the backend

export type PetResult =
  | { ok: true; gained: number; pendingGain?: undefined }
  | { ok: true; gained: 0; pendingGain: Promise<number> } // value decided by the server
  | { ok: false; reason: "napping" | "maxed" | "unavailable" };

export type EquipResult =
  | { ok: true }
  | {
      ok: false;
      reason: "busy" | "not_found" | "network" | "error";
      message?: string;
    };

const NO_ITEMS: PetItemDto[] = [];

/** Same rule as the server: one equipped item per itemType. */
function applyEquip(
  items: PetItemDto[],
  petItemId: string,
  willEquip: boolean,
): PetItemDto[] {
  const target = items.find((i) => i.id === petItemId);
  if (!target) return items;
  const type = target.shopItem.itemType;
  return items.map((i) => {
    if (i.id === petItemId) return { ...i, isEquipped: willEquip };
    if (willEquip && i.shopItem.itemType === type)
      return { ...i, isEquipped: false };
    return i;
  });
}

export function usePetCare(pet: PetDto | null) {
  const { syncPet, updatePet, refreshPet } = usePet();
  const [now, setNow] = useState(Date.now());
  const [petError, setPetError] = useState<string | null>(null);

  // The wardrobe IS the shared pet's items: one source of truth for the
  // Sanctuary, the Shop and the 3D model, which survives leaving the page.
  const items = pet?.items ?? NO_ITEMS;

  // Latest pet, readable synchronously between fast taps
  const petRef = useRef(pet);
  useEffect(() => {
    petRef.current = pet;
  }, [pet]);

  // Petting requests run one after another, in tap order
  const petQueue = useRef<Promise<void>>(Promise.resolve());
  const pendingPets = useRef(0);

  // Equip saves run one after another, in tap order
  const equipQueue = useRef<Promise<void>>(Promise.resolve());
  const pendingEquips = useRef(0);
  const equipFailed = useRef(false);

  // ---------- Petting: derived state ----------

  const cooldownUntilMs = pet?.petCooldownUntil
    ? new Date(pet.petCooldownUntil).getTime()
    : null;
  const cooldownMsLeft = cooldownUntilMs
    ? Math.max(0, cooldownUntilMs - now)
    : 0;
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

  // Window pets: 0 while napping, a full window once the nap has passed (server refills on next request)
  const windowPets = isNapping
    ? 0
    : cooldownUntilMs
      ? PETTINGS_PER_WINDOW
      : (pet?.pettingsLeft ?? 0);
  const bonusPets = pet?.bonusPets ?? 0;
  const petsLeft = windowPets + bonusPets;
  // Napping only blocks petting when there are no bonus pets either
  const canPet = !!pet && !isAffectionMaxed && petsLeft > 0;

  // ---------- Petting: background request ----------

  const sendPetRequest = useCallback((): Promise<PetDto | null> => {
    pendingPets.current += 1;

    const result = petQueue.current.then(async () => {
      try {
        const updated = await petPet();
        pendingPets.current -= 1;
        if (pendingPets.current === 0) syncPet(updated);
        return updated;
      } catch (err) {
        pendingPets.current -= 1;
        await refreshPet();
        const apiErr = err instanceof ApiError ? err : null;
        setPetError(
          apiErr?.status === 429
            ? "Your capy needs a nap first."
            : apiErr?.status === 409
              ? "Your capy is already as happy as can be!"
              : "Couldn't reach your capy. Try again.",
        );
        return null;
      }
    });

    petQueue.current = result.then(() => undefined); // keep the queue a Promise<void>
    return result;
  }, [syncPet, refreshPet]);

  // ---------- Petting: optimistic action ----------

  const petTheCapy = useCallback((): PetResult => {
    const current = petRef.current;
    if (!current) return { ok: false, reason: "unavailable" };

    const nowMs = Date.now();
    const cooldownMs = current.petCooldownUntil
      ? new Date(current.petCooldownUntil).getTime()
      : null;
    const napOver = cooldownMs !== null && cooldownMs <= nowMs;
    const stillNapping = cooldownMs !== null && cooldownMs > nowMs;

    // Same availability rules as the server
    const windowAvailable = stillNapping
      ? 0
      : napOver
        ? PETTINGS_PER_WINDOW
        : current.pettingsLeft;
    const bonusAvailable = current.bonusPets ?? 0;

    if (windowAvailable + bonusAvailable <= 0)
      return { ok: false, reason: "napping" };
    if (current.petCurrentAffectionPoint >= MAX_AFFECTION)
      return { ok: false, reason: "maxed" };

    const stream = current.upcomingAffectionGains ?? [];

    // Fallback: no known value yet, so skip the instant update and let the server decide
    if (stream.length === 0) {
      const before = current.petCurrentAffectionPoint;
      const pendingGain = sendPetRequest().then((updated) =>
        updated ? Math.max(0, updated.petCurrentAffectionPoint - before) : 0,
      );
      return { ok: true, gained: 0, pendingGain };
    }

    // 1. Optimistic update: window pets first, then bonus pets
    const gained = Math.min(
      stream[0],
      MAX_AFFECTION - current.petCurrentAffectionPoint,
    );
    const useWindow = windowAvailable > 0;
    const windowLeft = useWindow ? windowAvailable - 1 : windowAvailable;

    const optimistic: PetDto = {
      ...current,
      petCurrentAffectionPoint: current.petCurrentAffectionPoint + gained,
      pettingsLeft: useWindow ? windowLeft : current.pettingsLeft,
      bonusPets: useWindow ? bonusAvailable : bonusAvailable - 1,
      // The server always keeps extra values, so just drop the one we used
      upcomingAffectionGains: stream.slice(1),
      petCooldownUntil:
        useWindow && windowLeft <= 0
          ? new Date(nowMs + PET_COOLDOWN_MS).toISOString() // last window pet starts the nap
          : napOver
            ? null
            : current.petCooldownUntil,
    };
    petRef.current = optimistic; // the next fast tap sees this immediately
    updatePet(() => optimistic);

    // 2. Confirm with the server in the background
    sendPetRequest();

    return { ok: true, gained };
  }, [updatePet, sendPetRequest]);

  const clearPetError = useCallback(() => setPetError(null), []);

  // ---------- Wardrobe: optimistic equip ----------

  const toggleEquip = useCallback(
    (petItemId: string): Promise<EquipResult> => {
      const current = petRef.current;
      const target = (current?.items ?? []).find((i) => i.id === petItemId);

      if (!current || !target) {
        return refreshPet().then(() => ({
          ok: false as const,
          reason: "not_found" as const,
          message: "That item isn't available anymore.",
        }));
      }

      // Decide from the LATEST local state, so fast taps toggle correctly
      const willEquip = !target.isEquipped;

      // 1. Instant UI update (wardrobe card + 3D model)
      const optimistic: PetDto = {
        ...current,
        items: applyEquip(current.items ?? [], petItemId, willEquip),
      };
      petRef.current = optimistic; // the next fast tap sees this immediately
      updatePet((prev) => ({
        ...prev,
        items: applyEquip(prev.items ?? [], petItemId, willEquip),
      }));

      // 2. Save in the background, in tap order, so the server ends in the same state
      pendingEquips.current += 1;

      const result: Promise<EquipResult> = equipQueue.current.then(async () => {
        let outcome: EquipResult;
        try {
          await updatePetItemState(petItemId, willEquip);
          outcome = { ok: true };
        } catch (error) {
          equipFailed.current = true;
          const apiError =
            error instanceof ApiError
              ? error
              : new ApiError("Couldn't equip/unequip pet item.", 0);

          if (apiError.status === 404) {
            outcome = {
              ok: false,
              reason: "not_found",
              message: "That item isn't available anymore.",
            };
          } else if (apiError.status === 0) {
            outcome = {
              ok: false,
              reason: "network",
              message:
                "Couldn't save your capy's outfit. Check your connection.",
            };
          } else {
            console.error("Equip failed:", apiError);
            outcome = {
              ok: false,
              reason: "error",
              message:
                apiError.message || "Couldn't update your capy's outfit.",
            };
          }
        }

        pendingEquips.current -= 1;

        // 3. Once every queued save is done: if any failed, the UI may be ahead
        //    of the server, so reload the real state (this undoes what failed)
        if (pendingEquips.current === 0 && equipFailed.current) {
          equipFailed.current = false;
          await refreshPet();
        }

        return outcome;
      });

      equipQueue.current = result.then(() => undefined); // keep the queue a Promise<void>
      return result;
    },
    [updatePet, refreshPet],
  );

  return {
    level: pet?.petLevel.level ?? 1,
    exp: pet?.petCurrentExp ?? 0,
    maxExp: pet?.petLevel.threshold ?? 100,
    affection,
    items,
    petsLeft,
    windowPets,
    bonusPets,
    cooldownMsLeft,
    isNapping,
    canPet,
    isAffectionMaxed,
    pet: petTheCapy,
    petError,
    clearPetError,
    toggleEquip,
  };
}
