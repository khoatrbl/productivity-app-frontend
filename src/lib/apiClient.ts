import axios, { AxiosError } from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach the auth token to every request, once one exists.
// No need to pass it manually in each service call.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("capydo_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Normalizes any axios error into your app's ApiError shape,
// so the rest of the app never needs to know axios is involved.
export function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message ?? error.message;
    return new ApiError(message, status);
  }
  return new ApiError("Something went wrong. Please try again.", 0);
}

export default apiClient;