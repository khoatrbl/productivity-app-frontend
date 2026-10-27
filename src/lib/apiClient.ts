// lib/apiClient.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { refresh } from "../services/authServices";

const apiClient = axios.create({
  baseURL: "/api/v1", // relative: Vite proxy in dev, Vercel rewrite in prod
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------- Access token (memory only) ---------- */

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

/* ---------- Callbacks registered by AuthContext ---------- */

type AuthHandlers = {
  onTokenRefreshed: (token: string) => void;
  onSessionExpired: () => void;
};

let authHandlers: AuthHandlers | null = null;

export function setAuthHandlers(handlers: AuthHandlers | null) {
  authHandlers = handlers;
}

/* ---------- Request: attach the access token ---------- */

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/* ---------- Response: refresh on 401, retry once ---------- */

// A 401 from these means something else (wrong password, session over),
// so they must never trigger a refresh.
const NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
];

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    const isAuthCall = NO_REFRESH_PATHS.some((path) =>
      original?.url?.includes(path),
    );

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isAuthCall
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const { token } = await refresh(); // single-flight: concurrent 401s share one call
      setAccessToken(token);
      authHandlers?.onTokenRefreshed(token);
      original.headers.Authorization = `Bearer ${token}`;
      return apiClient(original);
    } catch {
      setAccessToken(null);
      authHandlers?.onSessionExpired();
      return Promise.reject(error);
    }
  },
);

/* ---------- Error normalization ---------- */

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string> | null;

  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string> | null = null,
  ) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// Backend sends field errors as [{ field, message }] (ApiErrorResponse.errors)
function parseFieldErrors(raw: unknown): Record<string, string> | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const result: Record<string, string> = {};
  for (const item of raw) {
    if (
      item &&
      typeof item.field === "string" &&
      typeof item.message === "string"
    ) {
      result[item.field] ??= item.message; // keep the first message per field
    }
  }
  return Object.keys(result).length > 0 ? result : null;
}

// Normalizes any axios error into the app's ApiError shape,
// so the rest of the app never needs to know axios is involved.
export function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message ?? error.message;
    const fieldErrors = parseFieldErrors(error.response?.data?.errors);
    return new ApiError(message, status, fieldErrors);
  }
  return new ApiError("Something went wrong. Please try again.", 0);
}

export default apiClient;
