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
}
