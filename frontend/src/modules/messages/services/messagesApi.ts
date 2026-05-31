import { apiClient } from '@/shared/lib/apiClient'
import type { Page } from '@/shared/lib/types'
import type { ChatMessage, Conversation } from '../types'

export const messagesApi = {
  getConversations(): Promise<Conversation[]> {
    return apiClient.get('/messages/conversations').then((r) => r.data.data)
  },

  getOrCreate(otherUserId: string): Promise<Conversation> {
    return apiClient.post(`/messages/conversations/with/${otherUserId}`).then((r) => r.data.data)
  },

  getMessages(conversationId: string, page = 0, size = 50): Promise<Page<ChatMessage>> {
    return apiClient
      .get(`/messages/conversations/${conversationId}/messages`, { params: { page, size } })
      .then((r) => r.data.data)
  },

  send(conversationId: string, body: string): Promise<ChatMessage> {
    return apiClient
      .post(`/messages/conversations/${conversationId}/messages`, { body })
      .then((r) => r.data.data)
  },

  getUnreadCount(): Promise<number> {
    return apiClient.get('/messages/unread-count').then((r) => r.data.data)
  },
}
