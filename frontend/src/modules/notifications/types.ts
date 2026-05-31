export type NotificationType =
  | 'RESERVATION_CREATED'
  | 'NEW_FOLLOWER'
  | 'WELCOME'
  | 'EVENT_RSVP'
  | 'LISTING_SOLD'
  | 'LOST_FOUND_RESOLVED'

export type ReferenceType = 'RESERVATION' | 'USER_PROFILE' | 'EVENT' | 'LISTING' | 'LOST_FOUND_ITEM'

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
