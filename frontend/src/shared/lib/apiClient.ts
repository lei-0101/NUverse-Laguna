import axios, { AxiosError } from 'axios'
import type { ApiError, ApiResponse } from './types'
import { useAuthStore } from '@/shared/store/authStore'

/**
 * Single Axios instance for the app. `withCredentials` ensures the HTTP-only
 * JWT cookie is sent with every request; in development requests are proxied
 * by Vite so they stay same-origin.
 */
export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// A 401 means the session is gone or invalid. Clearing the auth store lets the
// route guards react and redirect to login; no hard navigation required.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearUser()
    }
    return Promise.reject(error)
  },
)

/** Extracts the typed payload from the envelope for a successful request. */
export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  return response.data.data
}

/** Converts any thrown Axios error into a UI-friendly {@link ApiError}. */
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>
    return {
      status: axiosError.response?.status ?? 0,
      message:
        axiosError.response?.data?.message ??
        'Something went wrong. Please try again.',
    }
  }
  return { status: 0, message: 'An unexpected error occurred.' }
}
