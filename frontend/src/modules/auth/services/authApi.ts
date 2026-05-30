import { apiClient, unwrap } from '@/shared/lib/apiClient'
import type { ApiResponse } from '@/shared/lib/types'
import type { LoginPayload, RegisterPayload, UserResponse } from '../types'

/** Thin transport layer for the auth endpoints — no business logic. */
export const authApi = {
  register(payload: RegisterPayload): Promise<void> {
    return apiClient.post('/auth/register', payload).then(() => undefined)
  },

  login(payload: LoginPayload): Promise<UserResponse> {
    return unwrap<UserResponse>(apiClient.post('/auth/login', payload))
  },

  logout(): Promise<void> {
    return apiClient.post('/auth/logout').then(() => undefined)
  },

  getCurrentUser(): Promise<UserResponse> {
    return unwrap<UserResponse>(apiClient.get('/auth/me'))
  },

  verifyEmail(token: string): Promise<ApiResponse<null>> {
    return apiClient
      .get<ApiResponse<null>>('/auth/verify-email', { params: { token } })
      .then((response) => response.data)
  },
}
