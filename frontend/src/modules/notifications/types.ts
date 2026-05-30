export type NotificationType = 'RESERVATION_CREATED' | 'NEW_FOLLOWER' | 'WELCOME' | 'EVENT_RSVP'

export type ReferenceType = 'RESERVATION' | 'USER_PROFILE' | 'EVENT'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  referenceId: string | null
  referenceType: ReferenceType | null
  read: boolean
  createdAt: string
}

export interface UnreadCountResponse {
  count: number
}
