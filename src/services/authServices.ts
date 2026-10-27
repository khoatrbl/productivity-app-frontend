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

export async function validateToken(): Promise<void> {
  await apiClient.get("/auth/validate"); // throws (via the response interceptor) if invalid
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function register(payload: {
  email: string;
  rawPassword: string;
  confirmPassword: string;
  displayName: string;
  timezone: string;
}): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/register",
      payload,
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

let refreshInFlight: Promise<AuthResponse> | null = null;

export async function refresh(): Promise<AuthResponse> {
  if (!refreshInFlight) {
    refreshInFlight = apiClient
      .post<AuthResponse>("/auth/refresh")
      .then(({ data }) => data)
      .catch((error) => {
        throw toApiError(error);
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    throw toApiError(error);
  }
}
