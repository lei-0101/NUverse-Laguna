import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore, type AuthUser } from './authStore'

const user: AuthUser = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'student@national-u.edu.ph',
  fullName: 'Juan Dela Cruz',
  role: 'ROLE_STUDENT',
  status: 'ACTIVE',
}

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isBootstrapped: false })
  })

  it('marks bootstrapped and stores the user on setUser', () => {
    useAuthStore.getState().setUser(user)
    const state = useAuthStore.getState()
    expect(state.user).toEqual(user)
    expect(state.isBootstrapped).toBe(true)
  })

  it('clears the user but stays bootstrapped on clearUser', () => {
    useAuthStore.getState().setUser(user)
    useAuthStore.getState().clearUser()
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isBootstrapped).toBe(true)
  })
})
