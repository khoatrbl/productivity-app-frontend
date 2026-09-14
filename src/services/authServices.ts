import apiClient, { toApiError } from "../lib/apiClient";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", { email, password });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function register(payload: {
  email: string;
  password: string;
  displayName: string;
  timezone: string;
}): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}