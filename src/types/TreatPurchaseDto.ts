import type { InventoryItemDto } from "./InventoryItemDto";

export interface TreatPurchaseResponseDto {
  inventoryItem: InventoryItemDto;
  coins: number;
  coinsSpent: number;
}