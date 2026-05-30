import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/shared/store/authStore'
import { authApi } from '../services/authApi'
import type { LoginPayload, RegisterPayload } from '../types'

const SESSION_KEY = ['auth', 'me'] as const

/**
 * Bootstraps the session on app load by calling /auth/me and syncing the result
 * into the global auth store. A 401 simply means "not logged in".
 */
export function useSessionBootstrap() {
  const setUser = useAuthStore((state) => state.setUser)
  const clearUser = useAuthStore((state) => state.clearUser)

  const query = useQuery({
    queryKey: SESSION_KEY,
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (query.isSuccess) setUser(query.data)
    if (query.isError) clearUser()
  }, [query.isSuccess, query.isError, query.data, setUser, clearUser])

  return query
}

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (user) => {
      setUser(user)
      queryClient.setQueryData(SESSION_KEY, user)
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  })
}

export function useLogout() {
  const clearUser = useAuthStore((state) => state.clearUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearUser()
      queryClient.clear()
    },
  })
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
  })
}
