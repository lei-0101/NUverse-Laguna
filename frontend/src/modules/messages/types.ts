export interface Conversation {
  id: string
  otherUserId: string
  otherUserName: string
  otherUserAvatar: string | null
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  body: string
  read: boolean
  createdAt: string
}
