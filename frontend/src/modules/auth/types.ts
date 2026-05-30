import type { AuthUser } from '@/shared/store/authStore'

/** Mirrors the backend `UserResponse` DTO. */
export type UserResponse = AuthUser

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
}

export interface LoginPayload {
  email: string
  password: string
}
