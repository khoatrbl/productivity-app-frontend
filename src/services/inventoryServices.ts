import apiClient from "../lib/apiClient";
import type { InventoryItemDto } from "../types/InventoryItemDto";

export async function getInventory(): Promise<InventoryItemDto[]> {
  const res = await apiClient.get<InventoryItemDto[]>("/me/inventory");
  return res.data ?? [];
}