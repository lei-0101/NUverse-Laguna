import { useState } from 'react'
import { Button, EmptyState, Pagination, Spinner } from '@/shared/components/ui'
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../hooks/useNotifications'
import { NotificationItem } from '../components/NotificationItem'

export function NotificationsPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useNotifications(page)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()

  const notifications = data?.content ?? []
  const hasUnread = notifications.some((n) => !n.read)

  return (
    <div className="mx-auto max-w-2xl animate-[page-enter_0.3s_ease-out]">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
        {hasUnread && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            isLoading={markAllAsRead.isPending}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="You're all caught up"
          description="New activity like reservations, followers, and campus updates will appear here."
          icon={
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      ) : (
        <div
          className="rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden"
          role="list"
          aria-label="Notifications"
        >
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkAsRead={(id) => markAsRead.mutate(id)}
              onDelete={(id) => deleteNotification.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            page={data.number}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
