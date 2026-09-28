export const ItemType = {
    HEADWEAR: 'HEADWEAR',
    BODYWEAR: 'BODYWEAR',
    FOOTWEAR: 'FOOTWEAR'
} as const;

export type ItemType = typeof ItemType[keyof typeof ItemType];