import { useCallback, useEffect, useState } from "react";
import {
  AFFECTION_PER_PET, MAX_AFFECTION, PETS_PER_WINDOW, PET_COOLDOWN_MS,
} from "../data/mockSanctuary";
import type { PetDto, PetItemDto } from "../types/PetDto";

export function usePetCare(pet: PetDto | null) {
  const [items, setItems] = useState<PetItemDto[]>(pet?.items ?? []);
  const [affection, setAffection] = useState(pet?.petCurrentAffectionPoint ?? 0);
  const [petsLeft, setPetsLeft] = useState(PETS_PER_WINDOW);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!pet) return;
    setItems(pet.items ?? []);
    setAffection(pet.petCurrentAffectionPoint ?? 0);
  }, [pet]);

  useEffect(() => {
    if (!cooldownUntil) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= cooldownUntil) {
        setCooldownUntil(null);
        setPetsLeft(PETS_PER_WINDOW);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const cooldownMsLeft = cooldownUntil ? Math.max(0, cooldownUntil - now) : 0;
  const isAffectionMaxed = affection >= MAX_AFFECTION;
  const canPet = petsLeft > 0 && !cooldownUntil && !isAffectionMaxed;

  const petTheCapy = useCallback((): boolean => {
    if (!canPet) return false;
    setAffection((a) => Math.min(MAX_AFFECTION, a + AFFECTION_PER_PET));
    const remaining = petsLeft - 1;
    setPetsLeft(remaining);
    if (remaining === 0) {
      setNow(Date.now());
      setCooldownUntil(Date.now() + PET_COOLDOWN_MS);
    }
    return true;
  }, [canPet, petsLeft]);

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