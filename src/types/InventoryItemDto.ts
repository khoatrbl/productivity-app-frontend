import type { TreatDto } from "./TreatDto";

export interface InventoryItemDto {
  userId: string;
  treatDto: TreatDto;
  quantity: number;
}