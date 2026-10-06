import type { TreatDto } from "./TreatDto";

export type FortuneType = "COINS" | "TREATS";

export interface PetFortuneDto {
  type: FortuneType;
  amount: number;
  treat: TreatDto | null;
}