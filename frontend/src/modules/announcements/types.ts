export type AnnouncementPriority = 'GENERAL' | 'IMPORTANT' | 'CRITICAL'

export interface Announcement {
  id: string
  title: string
  body: string
  priority: AnnouncementPriority
  createdBy: string
  active: boolean
  expiresAt: string | null
  createdAt: string
  imageUrl: string | null
  reactionCount: number
  userReaction: string | null
}

export interface CreateAnnouncementPayload {
  title: string
  body: string
  priority: AnnouncementPriority
  expiresAt: string | null
  imageUrl: string | null
}

export interface UpdateAnnouncementPayload {
  title: string
  body: string
  priority: AnnouncementPriority
  expiresAt: string | null
  imageUrl: string | null
}
