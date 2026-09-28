import apiClient, { toApiError } from "../lib/apiClient";
import type { PetDto } from "../types/PetDto";

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