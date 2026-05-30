import { apiClient } from '@/shared/lib/apiClient'
import type { Page } from '@/shared/lib/types'
import type { Suggestion } from '../types'

export const suggestionsApi = {
  getAll(page = 0): Promise<Page<Suggestion>> {
    return apiClient.get('/suggestions', { params: { page } }).then((r) => r.data.data)
  },

  create(title: string, description: string): Promise<Suggestion> {
    return apiClient.post('/suggestions', { title, description }).then((r) => r.data.data)
  },

  vote(id: string): Promise<Suggestion> {
    return apiClient.post(`/suggestions/${id}/vote`).then((r) => r.data.data)
  },

  unvote(id: string): Promise<Suggestion> {
    return apiClient.delete(`/suggestions/${id}/vote`).then((r) => r.data.data)
  },
}
