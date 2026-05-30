import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { NotificationBell } from './NotificationBell'
import { notificationsApi } from '../services/notificationsApi'
import type { Page } from '@/shared/lib/types'
import type { Notification } from '../types'

vi.mock('../services/notificationsApi', () => ({
  notificationsApi: {
    getUnreadCount: vi.fn(),
    getMyNotifications: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
  },
}))

const emptyPage: Page<Notification> = {
  content: [],
  number: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
}

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
  return { client, wrapper }
}

describe('NotificationBell', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the bell button with an accessible label', async () => {
    vi.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ count: 0 })
    const { wrapper } = setup()

    render(<NotificationBell />, { wrapper })

    await waitFor(() => expect(notificationsApi.getUnreadCount).toHaveBeenCalled())
    expect(screen.getByRole('button', { name: /notifications/i })).toBeDefined()
  })

  it('shows no badge when unread count is zero', async () => {
    vi.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ count: 0 })
    const { wrapper } = setup()

    const { container } = render(<NotificationBell />, { wrapper })
    await waitFor(() => expect(notificationsApi.getUnreadCount).toHaveBeenCalled())

    // Badge span should not be present
    const badge = container.querySelector('[aria-hidden="true"].bg-danger')
    expect(badge).toBeNull()
  })

  it('shows badge with count when there are unread notifications', async () => {
    vi.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ count: 3 })
    const { wrapper } = setup()

    render(<NotificationBell />, { wrapper })

    await waitFor(() => screen.getByText('3'))
    expect(screen.getByText('3')).toBeDefined()
  })

  it('shows 99+ when unread count exceeds 99', async () => {
    vi.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ count: 150 })
    const { wrapper } = setup()

    render(<NotificationBell />, { wrapper })

    await waitFor(() => screen.getByText('99+'))
    expect(screen.getByText('99+')).toBeDefined()
  })

  it('opens the notification panel on click', async () => {
    vi.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ count: 0 })
    vi.mocked(notificationsApi.getMyNotifications).mockResolvedValue(emptyPage)
    const { wrapper } = setup()

    render(<NotificationBell />, { wrapper })
    const bell = screen.getByRole('button', { name: /notifications/i })

    fireEvent.click(bell)

    await waitFor(() => screen.getByRole('dialog'))
    expect(screen.getByRole('dialog')).toBeDefined()
  })

  it('sets aria-expanded=true when panel is open', async () => {
    vi.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ count: 0 })
    vi.mocked(notificationsApi.getMyNotifications).mockResolvedValue(emptyPage)
    const { wrapper } = setup()

    render(<NotificationBell />, { wrapper })
    const bell = screen.getByRole('button', { name: /notifications/i })

    fireEvent.click(bell)

    await waitFor(() => expect(bell.getAttribute('aria-expanded')).toBe('true'))
  })

  it('shows empty state message when there are no notifications', async () => {
    vi.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ count: 0 })
    vi.mocked(notificationsApi.getMyNotifications).mockResolvedValue(emptyPage)
    const { wrapper } = setup()

    render(<NotificationBell />, { wrapper })
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))

    await waitFor(() => screen.getByText(/all caught up/i))
    expect(screen.getByText(/all caught up/i)).toBeDefined()
  })
})
