import apiClient, { toApiError } from "../lib/apiClient";
import { ApiError } from "../lib/apiClient";
import { resizeImage } from "../utils/resizeImage";
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

interface AvatarUploadUrlResponse {
  uploadUrl: string;
  path: string;
}

export async function uploadAvatar(file: File): Promise<ProfileDto> {
  const image = await resizeImage(file);

  // 1. Ask the backend for a one-time upload URL
  let upload: AvatarUploadUrlResponse;
  try {
    const { data } = await apiClient.post<AvatarUploadUrlResponse>(
      "/me/avatar/upload-url",
      {
        contentType: image.type,
      },
    );
    upload = data;
  } catch (err) {
    throw toApiError(err);
  }

  // 2. Upload straight to Supabase. Plain fetch on purpose: no JWT, no refresh interceptor.
  const res = await fetch(upload.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": image.type },
    body: image,
  });
  if (!res.ok) {
    throw new ApiError(
      "Couldn't upload the image. Please try again.",
      res.status,
    );
  }

  // 3. Make it the user's avatar
  try {
    const { data } = await apiClient.patch<ProfileDto>("/me/avatar", {
      path: upload.path,
    });
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}
