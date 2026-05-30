import { apiClient } from '@/shared/lib/apiClient'
import type { Page } from '@/shared/lib/types'
import type { CampusEvent, EventCard, RsvpResponse, CreateEventData, UpdateEventData, EventCategory, EventStatus } from '../types'

export const eventsApi = {
  getEvents(params?: {
    category?: EventCategory
    status?: EventStatus
    upcomingOnly?: boolean
    page?: number
    size?: number
  }): Promise<Page<EventCard>> {
    return apiClient.get('/events', { params }).then((r) => r.data.data)
  },

  getEvent(eventId: string): Promise<CampusEvent> {
    return apiClient.get(`/events/${eventId}`).then((r) => r.data.data)
  },

  createEvent(data: CreateEventData): Promise<CampusEvent> {
    return apiClient.post('/events', data).then((r) => r.data.data)
  },

  updateEvent(eventId: string, data: UpdateEventData): Promise<CampusEvent> {
    return apiClient.put(`/events/${eventId}`, data).then((r) => r.data.data)
  },

  publishEvent(eventId: string): Promise<CampusEvent> {
    return apiClient.patch(`/events/${eventId}/publish`).then((r) => r.data.data)
  },

  cancelEvent(eventId: string): Promise<CampusEvent> {
    return apiClient.patch(`/events/${eventId}/cancel`).then((r) => r.data.data)
  },

  deleteEvent(eventId: string): Promise<void> {
    return apiClient.delete(`/events/${eventId}`).then(() => undefined)
  },

  rsvp(eventId: string): Promise<CampusEvent> {
    return apiClient.post(`/events/${eventId}/rsvp`).then((r) => r.data.data)
  },

  cancelRsvp(eventId: string): Promise<void> {
    return apiClient.delete(`/events/${eventId}/rsvp`).then(() => undefined)
  },

  getMyRsvps(params?: { page?: number; size?: number }): Promise<Page<RsvpResponse>> {
    return apiClient.get('/events/my-rsvps', { params }).then((r) => r.data.data)
  },

  uploadImage(file: File): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    return apiClient
      .post('/events/images', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.data.url as string)
  },
}
