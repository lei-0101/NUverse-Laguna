import { apiClient } from '@/shared/lib/apiClient'
import type { Page } from '@/shared/lib/types'
import type { LostFoundComment, LostFoundItem, CreateLostFoundPayload } from '../types'
import type { ReactionSummary } from '@/shared/components/ReactionsModal'

export const lostFoundApi = {
  browse(params: { type?: string; status?: string; keyword?: string; page?: number; size?: number } = {}): Promise<Page<LostFoundItem>> {
    return apiClient.get('/lost-found', { params }).then((r) => r.data.data)
  },

  getById(id: string): Promise<LostFoundItem> {
    return apiClient.get(`/lost-found/${id}`).then((r) => r.data.data)
  },

  getMine(page = 0): Promise<Page<LostFoundItem>> {
    return apiClient.get('/lost-found/mine', { params: { page } }).then((r) => r.data.data)
  },

  create(data: CreateLostFoundPayload): Promise<LostFoundItem> {
    return apiClient.post('/lost-found', data).then((r) => r.data.data)
  },

  update(id: string, data: CreateLostFoundPayload): Promise<LostFoundItem> {
    return apiClient.put(`/lost-found/${id}`, data).then((r) => r.data.data)
  },

  resolve(id: string): Promise<LostFoundItem> {
    return apiClient.patch(`/lost-found/${id}/resolve`).then((r) => r.data.data)
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`/lost-found/${id}`).then(() => undefined)
  },

  toggleReaction(id: string, emoji = '👍'): Promise<LostFoundItem> {
    return apiClient.post(`/lost-found/${id}/react`, null, { params: { emoji } }).then((r) => r.data.data)
  },

  getComments(id: string): Promise<LostFoundComment[]> {
    return apiClient.get(`/lost-found/${id}/comments`).then((r) => r.data.data)
  },

  addComment(id: string, body: string): Promise<LostFoundComment> {
    return apiClient.post(`/lost-found/${id}/comments`, { body }).then((r) => r.data.data)
  },

  deleteComment(commentId: string): Promise<void> {
    return apiClient.delete(`/lost-found/comments/${commentId}`).then(() => undefined)
  },

  adminDeleteComment(commentId: string): Promise<void> {
    return apiClient.delete(`/lost-found/comments/${commentId}/admin`).then(() => undefined)
  },

  adminDelete(id: string): Promise<void> {
    return apiClient.delete(`/lost-found/${id}/admin`).then(() => undefined)
  },

  getReactions(id: string): Promise<ReactionSummary[]> {
    return apiClient.get(`/lost-found/${id}/reactions`).then((r) => r.data.data)
  },
}
