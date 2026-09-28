import type { ShopItemsDto } from "./ShopItemsDto"
import type { LocalDateTime } from "./TaskCardData"

export interface PetLevelDto {
    level: number,
    threshold: number
}

export interface PetItemDto {
    item: ShopItemsDto,
    purchasedAt: LocalDateTime
}

export interface PetDto {
    id: string,
    ownerId: string,
    petLevel: PetLevelDto,
    name: string,
    petCurrentExp: number,
    items: PetItemDto[]
}