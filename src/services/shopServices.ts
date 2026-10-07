import apiClient, { toApiError } from "../lib/apiClient";
import type { PetItemPurchaseResponse } from "../types/PetItemPurchaseResponse";
import type { ShopItemsDto } from "../types/ShopItemsDto";
import type { TreatDto } from "../types/TreatDto";
import type { TreatPurchaseResponseDto } from "../types/TreatPurchaseDto";

let shopItemsPromise: Promise<ShopItemsDto[]> | null = null;
let shopItemsSnapshot: ShopItemsDto[] | null = null;

/** Fetches once, then reuses the same result. Retries on the next call if it failed. */
export function getShopItemsCached(): Promise<ShopItemsDto[]> {
  if (!shopItemsPromise) {
    shopItemsPromise = getShopItems()
      .then((items) => {
        shopItemsSnapshot = items;
        return items;
      })
      .catch((err) => {
        shopItemsPromise = null; // allow a retry later
        throw err;
      });
  }
  return shopItemsPromise;
}

/** Already-loaded items, or null if not fetched yet. Lets components render instantly. */
export function getShopItemsSnapshot(): ShopItemsDto[] | null {
  return shopItemsSnapshot;
}

/** Fire-and-forget warm-up. */
export function prefetchShopItems() {
  getShopItemsCached().catch(() => {});
}

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

export async function purchaseTreat(treatId: string): Promise<TreatPurchaseResponseDto> {
  const res = await apiClient.post<TreatPurchaseResponseDto>(`/shop/items/treats/${treatId}/purchases`);
  return res.data;
}

export async function purchaseShopItem(shopItemId: string): Promise<PetItemPurchaseResponse> {
    try {
        const {data} = await apiClient.post<PetItemPurchaseResponse>(`/shop/items/${shopItemId}/purchases`);

        return data;
    } catch (error) {
        throw toApiError(error);
    }

}