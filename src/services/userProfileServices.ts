import apiClient, { toApiError } from "../lib/apiClient";
import type { CoinsDto } from "../types/CoinsDto";
import type { ProfileDto } from "../types/UserProfile";
import type { UpdateExpDto } from "../types/UpdateExpDto";
import type { UpdateProfileResponse } from "../types/UpdateProfileResponse";
import type { UpdatePasswordRequest } from "../types/UpdatePasswordRequest";

export async function getProfile(): Promise<ProfileDto> {
  try {
    const { data } = await apiClient.get<ProfileDto>("/me"); // adjust to your real endpoint path
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function addExp(amount: number): Promise<UpdateExpDto> {
  try {
    const { data } = await apiClient.patch("/me/exp", { expGained: amount });

    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function addCoins(amount: number): Promise<CoinsDto> {
  try {
    const { data } = await apiClient.patch<CoinsDto>("/me/coins", {
      amount: amount,
    });

    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateUserProfile(
  displayName: string,
): Promise<UpdateProfileResponse> {
  try {
    const { data } = await apiClient.patch<UpdateProfileResponse>("/me", {
      displayName: displayName,
    });

    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function changePassword(
  body: UpdatePasswordRequest,
): Promise<void> {
  try {
    await apiClient.patch("/me/passwords", body);
  } catch (err) {
    throw toApiError(err);
  }
}
