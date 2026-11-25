import type { ShopItemsDto } from "./ShopItemsDto";
import type { LocalDateTime } from "./TaskCardData";

export interface PetLevelDto {
  level: number;
  threshold: number;
}

export interface PetItemDto {
  id: string;
  shopItem: ShopItemsDto;
  isEquipped: boolean;
  purchasedAt: LocalDateTime; // ISO LocalDateTime
}

export interface PetDto {
  id: string;
  ownerId: string;
  petLevel: PetLevelDto;
  name: string;
  petCurrentExp: number;
  petCurrentAffectionPoint: number;
  affectionTier: AffectionTierDto;
  upcomingAffectionGains: number[];
  pettingsLeft: number;
  bonusPets: number;
  petCooldownUntil: string | null; // ISO instant
  affectionLostSinceLastVisit: number | null;
  items: PetItemDto[];
}

export type AffectionTierCode = "SHY" | "CONTENT" | "PLAYFUL" | "BEST_BUD";

export interface AffectionTierDto {
  code: AffectionTierCode;
  displayName: string;
  minAffection: number;
  nextTierAt: number | null;
  nextTierName: string | null;
}
