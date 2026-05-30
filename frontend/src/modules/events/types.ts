export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED'

export type EventCategory =
  | 'ACADEMIC'
  | 'CULTURAL'
  | 'SPORTS'
  | 'SEMINAR'
  | 'SOCIAL'
  | 'OTHER'

export type RsvpStatus = 'ATTENDING' | 'CANCELLED'

export interface EventCard {
  id: string
  title: string
  category: EventCategory
  location: string
  startTime: string
  endTime: string | null
  status: EventStatus
  coverImageUrl: string | null
  rsvpCount: number
  capacity: number | null
}

export interface CampusEvent {
  id: string
  creatorId: string
  title: string
  description: string | null
  category: EventCategory
  location: string
  startTime: string
  endTime: string | null
  coverImageUrl: string | null
  capacity: number | null
  status: EventStatus
  rsvpCount: number
  rsvpOpen: boolean
  isRsvpd: boolean
  createdAt: string
}

export interface RsvpResponse {
  rsvpId: string
  eventId: string
  eventTitle: string
  eventLocation: string
  eventStartTime: string
  eventStatus: EventStatus
  rsvpStatus: RsvpStatus
  rsvpdAt: string
}

export interface CreateEventData {
  title: string
  description?: string
  category: EventCategory
  location: string
  startTime: string
  endTime?: string
  coverImageUrl?: string
  capacity?: number
}

export type UpdateEventData = CreateEventData
