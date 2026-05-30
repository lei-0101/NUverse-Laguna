import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '../services/eventsApi'
import type { EventCategory, EventStatus, CreateEventData, UpdateEventData } from '../types'

export const eventKeys = {
  all: ['events'] as const,
  list: (params?: object) => [...eventKeys.all, 'list', params] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
  myRsvps: (page?: number) => [...eventKeys.all, 'my-rsvps', page] as const,
}

export function useEvents(params?: {
  category?: EventCategory
  status?: EventStatus
  upcomingOnly?: boolean
  page?: number
  size?: number
}) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => eventsApi.getEvents(params),
  })
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: eventKeys.detail(eventId),
    queryFn: () => eventsApi.getEvent(eventId),
    enabled: !!eventId,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEventData) => eventsApi.createEvent(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  })
}

export function useUpdateEvent(eventId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateEventData) => eventsApi.updateEvent(eventId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
      qc.invalidateQueries({ queryKey: eventKeys.all })
    },
  })
}

export function usePublishEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) => eventsApi.publishEvent(eventId),
    onSuccess: (_data, eventId) => {
      qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
      qc.invalidateQueries({ queryKey: eventKeys.all })
    },
  })
}

export function useCancelEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) => eventsApi.cancelEvent(eventId),
    onSuccess: (_data, eventId) => {
      qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
      qc.invalidateQueries({ queryKey: eventKeys.all })
    },
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) => eventsApi.deleteEvent(eventId),
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  })
}

export function useRsvp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) => eventsApi.rsvp(eventId),
    onSuccess: (_data, eventId) => {
      qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
      qc.invalidateQueries({ queryKey: eventKeys.myRsvps() })
    },
  })
}

export function useCancelRsvp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) => eventsApi.cancelRsvp(eventId),
    onSuccess: (_data, eventId) => {
      qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
      qc.invalidateQueries({ queryKey: eventKeys.myRsvps() })
    },
  })
}

export function useMyRsvps(page = 0) {
  return useQuery({
    queryKey: eventKeys.myRsvps(page),
    queryFn: () => eventsApi.getMyRsvps({ page, size: 12 }),
  })
}

export function useUploadEventImage() {
  return useMutation({
    mutationFn: (file: File) => eventsApi.uploadImage(file),
  })
}
