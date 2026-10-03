import { ItemType } from "../types/ItemType";

const MOCK_ART: Record<ItemType, string[]> = {
  [ItemType.HEADWEAR]: ["🍊", "🐸", "🎩", "👒", "🎀"],
  [ItemType.BODYWEAR]: ["🧣", "👘", "🦺", "🧥", "👕"],
  [ItemType.FOOTWEAR]: ["🩴", "🥾", "🧦", "👟", "🩰"],
};

// Stable per item: the same id always gets the same emoji.
export function mockItemArt(id: string, type: ItemType): string {
  const pool = MOCK_ART[type];
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return pool[hash % pool.length];
}

export const TREAT_ART = { BASIC: "🍪", MEDIUM: "🧋", SPECIAL: "🍰" } as const;