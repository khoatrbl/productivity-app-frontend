export type TreatTier = "BASIC" | "MEDIUM" | "SPECIAL";

export interface TreatDto {
  id: string,
  treatTier: TreatTier;
  treatName: string;
  price: number; // coins in the shop
  exp: number;   // pet XP granted when fed
}