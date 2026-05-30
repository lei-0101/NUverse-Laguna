import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { notificationKeys, useMarkAllAsRead, useMarkAsRead, useUnreadCount } from './useNotifications'
import { notificationsApi } from '../services/notificationsApi'
import type { UnreadCountResponse } from '../types'

vi.mock('../services/notificationsApi', () => ({
  notificationsApi: {
    getMyNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
  },
}))

const NOTIFICATION_ID = 'notif-1'

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, wrapper }
}

// ── useUnreadCount ────────────────────────────────────────────────────────────

describe('useUnreadCount', () => {
  beforeEach(() => vi.clearAllMocks())

  it('selects and exposes the count field from the response', async () => {
    const response: UnreadCountResponse = { count: 5 }
    vi.mocked(notificationsApi.getUnreadCount).mockResolvedValue(response)
    const { wrapper } = setup()

    const { result } = renderHook(() => useUnreadCount(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(5)
  })

  it('returns 0 when there are no unread notifications', async () => {
    vi.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ count: 0 })
    const { wrapper } = setup()

    const { result } = renderHook(() => useUnreadCount(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(0)
  })
})

// ── useMarkAsRead ─────────────────────────────────────────────────────────────

describe('useMarkAsRead', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls markAsRead with the notification ID on success', async () => {
    vi.mocked(notificationsApi.markAsRead).mockResolvedValue(undefined)
    const { wrapper } = setup()
    const { result } = renderHook(() => useMarkAsRead(), { wrapper })

    result.current.mutate(NOTIFICATION_ID)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(notificationsApi.markAsRead).toHaveBeenCalledWith(NOTIFICATION_ID)
  })

  it('invalidates all notification queries on success', async () => {
    vi.mocked(notificationsApi.markAsRead).mockResolvedValue(undefined)
    const { client, wrapper } = setup()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')
    const { result } = renderHook(() => useMarkAsRead(), { wrapper })

    result.current.mutate(NOTIFICATION_ID)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: notificationKeys.all }),
    )
  })

  it('exposes an error when the API call fails', async () => {
    vi.mocked(notificationsApi.markAsRead).mockRejectedValue(new Error('Forbidden'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useMarkAsRead(), { wrapper })

    result.current.mutate(NOTIFICATION_ID)

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

// ── useMarkAllAsRead ──────────────────────────────────────────────────────────

describe('useMarkAllAsRead', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls markAllAsRead and invalidates all notification queries', async () => {
    vi.mocked(notificationsApi.markAllAsRead).mockResolvedValue(undefined)
    const { client, wrapper } = setup()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')
    const { result } = renderHook(() => useMarkAllAsRead(), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(notificationsApi.markAllAsRead).toHaveBeenCalledOnce()
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: notificationKeys.all }),
    )
  })
})

// ── notificationKeys ──────────────────────────────────────────────────────────

describe('notificationKeys', () => {
  it('list key includes page number', () => {
    expect(notificationKeys.list(2)).toContain(2)
  })

  it('list keys for different pages are distinct', () => {
    expect(notificationKeys.list(0)).not.toEqual(notificationKeys.list(1))
  })

  it('unreadCount key is derived from the all key', () => {
    const all = notificationKeys.all
    const unread = notificationKeys.unreadCount()
    expect(unread[0]).toBe(all[0])
  })
})
