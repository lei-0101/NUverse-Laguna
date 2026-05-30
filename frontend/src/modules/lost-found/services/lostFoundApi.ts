import { apiClient } from '@/shared/lib/apiClient'
import type { Page } from '@/shared/lib/types'
import type { LostFoundItem } from '../types'

export const lostFoundApi = {
  browse(params: { type?: string; status?: string; page?: number; size?: number } = {}): Promise<Page<LostFoundItem>> {
    return apiClient.get('/lost-found', { params }).then((r) => r.data.data)
  },

  getMine(page = 0): Promise<Page<LostFoundItem>> {
    return apiClient.get('/lost-found/mine', { params: { page } }).then((r) => r.data.data)
  },

  create(data: {
    type: string
    title: string
    description: string
    location: string
    itemDate: string
    imageUrl?: string
    contact: string
  }): Promise<LostFoundItem> {
    return apiClient.post('/lost-found', data).then((r) => r.data.data)
  },

  resolve(id: string): Promise<LostFoundItem> {
    return apiClient.patch(`/lost-found/${id}/resolve`).then((r) => r.data.data)
  },
}
