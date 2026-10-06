import type { InventoryItemDto } from "./InventoryItemDto";
import type { PetDto } from "./PetDto";
import type { PetFortuneDto } from "./PetFortuneDto";

export interface PetFeedResponse {
    pet: PetDto;
  inventoryItem: InventoryItemDto;
  expGained: number;
  levelsGained: number;
  coins: number;
  fortune: PetFortuneDto | null;
  fortuneInventoryItem: InventoryItemDto | null;
}