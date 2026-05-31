import { apiClient } from '@/shared/lib/apiClient'
import type { Page } from '@/shared/lib/types'
import type { Announcement, CreateAnnouncementPayload, UpdateAnnouncementPayload } from '../types'
import type { ReactionSummary } from '@/shared/components/ReactionsModal'

export const announcementsApi = {
  getActive(): Promise<Announcement[]> {
    return apiClient.get('/announcements/active').then((r) => r.data.data)
  },

  browse(page = 0, size = 20): Promise<Page<Announcement>> {
    return apiClient.get('/announcements/browse', { params: { page, size } }).then((r) => r.data.data)
  },

  getById(id: string): Promise<Announcement> {
    return apiClient.get(`/announcements/${id}`).then((r) => r.data.data)
  },

  getAll(page = 0, size = 20): Promise<Page<Announcement>> {
    return apiClient.get('/announcements', { params: { page, size } }).then((r) => r.data.data)
  },

  create(data: CreateAnnouncementPayload): Promise<Announcement> {
    return apiClient.post('/announcements', data).then((r) => r.data.data)
  },

  update(id: string, data: UpdateAnnouncementPayload): Promise<Announcement> {
    return apiClient.put(`/announcements/${id}`, data).then((r) => r.data.data)
  },

  deactivate(id: string): Promise<Announcement> {
    return apiClient.patch(`/announcements/${id}/deactivate`).then((r) => r.data.data)
  },

  activate(id: string): Promise<Announcement> {
    return apiClient.patch(`/announcements/${id}/activate`).then((r) => r.data.data)
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`/announcements/${id}`).then(() => undefined)
  },

  toggleReaction(id: string, emoji = '👍'): Promise<Announcement> {
    return apiClient.post(`/announcements/${id}/react`, null, { params: { emoji } }).then((r) => r.data.data)
  },

  getReactions(id: string): Promise<ReactionSummary[]> {
    return apiClient.get(`/announcements/${id}/reactions`).then((r) => r.data.data)
  },
}
