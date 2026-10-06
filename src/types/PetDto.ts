import type { ShopItemsDto } from "./ShopItemsDto"
import type { LocalDateTime } from "./TaskCardData"

export interface PetLevelDto {
    level: number,
    threshold: number
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
  pettingsLeft: number;
  petCooldownUntil: string | null; // ISO instant
  items: PetItemDto[];
}