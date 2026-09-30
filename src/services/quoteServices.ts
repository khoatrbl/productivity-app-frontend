import apiClient, { toApiError } from "../lib/apiClient";
import type { DailyQuoteData } from "../types/DailyQuoteData";
import type { ProfileDto } from "../types/UserProfile";

export async function getDailyQuote(): Promise<DailyQuoteData> {
  try {
    const { data } = await apiClient.get<DailyQuoteData>("/quotes/daily");
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export interface QuoteClaimResult {
  claimed: boolean;
  expGranted: number;
  profile: ProfileDto;
}

export async function claimDailyQuote(): Promise<QuoteClaimResult> {
  try {
    const { data } = await apiClient.patch<QuoteClaimResult>("/quotes/claims");
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}