import apiClient, { toApiError } from "../lib/apiClient";
import type { PetDto } from "../types/PetDto";
import type { PetFeedResponse } from "../types/PetFeedResponse";

export async function getMyPet(): Promise<PetDto> {
  try {
    const { data } = await apiClient.get<PetDto>("/pets");
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updatePetName(petName: string): Promise<PetDto> {
  try {
    const { data } = await apiClient.patch<PetDto>("/pets", { name: petName });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function feedPet(treatId: string): Promise<PetFeedResponse> {
  try {
    const {data} = await apiClient.post<PetFeedResponse>("/pets/feedings", {treatId: treatId});

    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function petPet(): Promise<PetDto> {
  try {
    const res = await apiClient.post<PetDto>("/pets/pettings");
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}