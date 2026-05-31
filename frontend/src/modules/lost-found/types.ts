export type ItemType = 'LOST' | 'FOUND'
export type ItemStatus = 'OPEN' | 'RESOLVED'

export interface LostFoundItem {
  id: string
  reporterId: string
  reporterName: string
  type: ItemType
  status: ItemStatus
  title: string
  description: string
  location: string
  itemDate: string
  imageUrl: string | null
  contact: string
  createdAt: string
  reactionCount: number
  userReaction: string | null
  commentCount: number
}

export interface LostFoundComment {
  id: string
  authorId: string
  authorName: string
  body: string
  createdAt: string
}

export interface CreateLostFoundPayload {
  type: ItemType
  title: string
  description: string
  location: string
  itemDate: string
  imageUrl: string | null
  contact: string
}
