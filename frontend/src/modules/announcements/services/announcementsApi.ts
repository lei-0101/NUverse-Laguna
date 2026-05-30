import { apiClient } from '@/shared/lib/apiClient'
import type { Page } from '@/shared/lib/types'
import type { Announcement } from '../types'

export const announcementsApi = {
  getActive(): Promise<Announcement[]> {
    return apiClient.get('/announcements/active').then((r) => r.data.data)
  },

  getAll(page = 0, size = 20): Promise<Page<Announcement>> {
    return apiClient.get('/announcements', { params: { page, size } }).then((r) => r.data.data)
  },

  create(data: { title: string; body: string; priority: string; expiresAt?: string }): Promise<Announcement> {
    return apiClient.post('/announcements', data).then((r) => r.data.data)
  },

  deactivate(id: string): Promise<Announcement> {
    return apiClient.patch(`/announcements/${id}/deactivate`).then((r) => r.data.data)
  },
}
