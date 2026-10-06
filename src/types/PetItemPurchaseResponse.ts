import type { PetItemDto } from "./PetDto";

export interface PetItemPurchaseResponse {
    petItem: PetItemDto;
    coins: number;
    coinsSpent: number;
}