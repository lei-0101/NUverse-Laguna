import { apiClient } from '@/shared/lib/apiClient'
import type { ChibiProfile } from '../types'

export const chibiApi = {
  getMyProfile(): Promise<ChibiProfile> {
    return apiClient.get('/chibi/me').then((r) => r.data.data)
  },

  getUserProfile(userId: string): Promise<ChibiProfile> {
    return apiClient.get(`/chibi/users/${userId}`).then((r) => r.data.data)
  },
}
