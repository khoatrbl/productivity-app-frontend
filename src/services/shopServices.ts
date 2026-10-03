import apiClient, { toApiError } from "../lib/apiClient";
import type { ShopItemsDto } from "../types/ShopItemsDto";
import type { TreatDto } from "../types/TreatDto";

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