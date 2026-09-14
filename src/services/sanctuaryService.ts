import apiClient, { toApiError } from "../lib/apiClient";
import type { ProfileDto } from "../types/SanctuaryProfile";

export async function getProfile(): Promise<ProfileDto> {
  try {
    const { data } = await apiClient.get<ProfileDto>("/me"); // adjust to your real endpoint path
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}