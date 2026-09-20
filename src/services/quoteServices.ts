// services/quoteService.ts
import apiClient, { toApiError } from "../lib/apiClient";
import type { DailyQuoteData } from "../types/DailyQuoteData";

export async function getDailyQuote(): Promise<DailyQuoteData> {
  try {
    const { data } = await apiClient.get<DailyQuoteData>("/quotes/daily");
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}