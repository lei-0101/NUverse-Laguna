import { create } from 'zustand'

/** Matches the backend `Role` enum, which uses Spring's ROLE_ prefix. */
export type UserRole = 'ROLE_STUDENT' | 'ROLE_FACULTY' | 'ROLE_ADMIN'

/** The authenticated principal — global session state shared across modules. */
export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: UserRole
  status: string
}

interface AuthState {
  user: AuthUser | null
  /** True once the initial /auth/me session check has resolved (success or not). */
  isBootstrapped: boolean
  setUser: (user: AuthUser) => void
  clearUser: () => void
  markBootstrapped: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isBootstrapped: false,
  setUser: (user) => set({ user, isBootstrapped: true }),
  clearUser: () => set({ user: null, isBootstrapped: true }),
  markBootstrapped: () => set({ isBootstrapped: true }),
}))
