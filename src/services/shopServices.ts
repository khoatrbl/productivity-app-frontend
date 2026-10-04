import apiClient, { toApiError } from "../lib/apiClient";
import type { ShopItemsDto } from "../types/ShopItemsDto";
import type { TreatDto } from "../types/TreatDto";
import type { TreatPurchaseResponseDto } from "../types/TreatPurchaseDto";

export async function getShopItems(): Promise<ShopItemsDto[]> {
    try {
        const res = await apiClient.get<ShopItemsDto[]>("/shop/items");
        return res.data ?? [];
    } catch (err) {
        throw toApiError(err);
    }
}

export async function getAllTreats(): Promise<TreatDto[]> {
    try {
        const {data} = await apiClient.get<TreatDto[]>("/shop/items/treats");

        return data ?? [];
    } catch (error) {
        throw toApiError(error);
    }
}

export async function purchaseTreat(treatId: string, quantity = 1): Promise<TreatPurchaseResponseDto> {
  const res = await apiClient.post<TreatPurchaseResponseDto>(`/shop/items/treats/${treatId}/purchases`, { quantity });
  return res.data;
}