import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useRsvp, useCancelRsvp, eventKeys } from './useEvents'
import { eventsApi } from '../services/eventsApi'
import type { CampusEvent } from '../types'

vi.mock('../services/eventsApi')

const mockedEventsApi = vi.mocked(eventsApi)

const sampleEvent: CampusEvent = {
  id: 'evt-1',
  creatorId: 'user-1',
  title: 'NU Open Day',
  description: null,
  category: 'ACADEMIC',
  location: 'NU Gym',
  startTime: '2026-06-10T09:00:00',
  endTime: null,
  coverImageUrl: null,
  capacity: 100,
  status: 'PUBLISHED',
  rsvpCount: 1,
  rsvpOpen: true,
  isRsvpd: true,
  createdAt: '2026-05-30T00:00:00',
}

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useRsvp', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls eventsApi.rsvp with the eventId', async () => {
    mockedEventsApi.rsvp.mockResolvedValueOnce(sampleEvent)

    const { result } = renderHook(() => useRsvp(), { wrapper })

    result.current.mutate('evt-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedEventsApi.rsvp).toHaveBeenCalledWith('evt-1')
  })

  it('surfaces API errors', async () => {
    mockedEventsApi.rsvp.mockRejectedValueOnce(new Error('capacity exceeded'))

    const { result } = renderHook(() => useRsvp(), { wrapper })

    result.current.mutate('evt-2')

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCancelRsvp', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls eventsApi.cancelRsvp with the eventId', async () => {
    mockedEventsApi.cancelRsvp.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useCancelRsvp(), { wrapper })

    result.current.mutate('evt-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedEventsApi.cancelRsvp).toHaveBeenCalledWith('evt-1')
  })
})

describe('eventKeys', () => {
  it('has stable list key structure', () => {
    expect(eventKeys.list()).toEqual(['events', 'list', undefined])
    expect(eventKeys.list({ page: 0 })).toEqual(['events', 'list', { page: 0 }])
  })

  it('has stable detail key structure', () => {
    expect(eventKeys.detail('evt-1')).toEqual(['events', 'detail', 'evt-1'])
  })

  it('has stable myRsvps key structure', () => {
    expect(eventKeys.myRsvps(0)).toEqual(['events', 'my-rsvps', 0])
  })
})
