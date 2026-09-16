import apiClient, { toApiError } from "../lib/apiClient";
import type { CoinsDto } from "../types/CoinsDto";
import type { ProfileDto } from "../types/SanctuaryProfile";
import type { UpdateExpDto } from "../types/UpdateExpDto";

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
        const {data} = await apiClient.patch("/me/exp", {expGained: amount});

        return data;
    } catch (error) {
        throw toApiError(error);
    }   
}

export async function addCoins(amount: number): Promise<CoinsDto> {
    try {
        const {data} = await apiClient.patch<CoinsDto>("/me/coins", {amount: amount});

        return data;
    } catch (error) {
        throw toApiError(error);    
    }
}