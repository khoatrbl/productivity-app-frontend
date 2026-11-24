import type { ItemType } from "./ItemType";

export interface ShopItemsDto {
  id: string;
  requiredUserLevel: number;
  name: string;
  description: string;
  itemType: ItemType;
  price: number;
  imageUrl: string | null;
  modelUrl?: string | null;
  socketName?: string | null;
}
