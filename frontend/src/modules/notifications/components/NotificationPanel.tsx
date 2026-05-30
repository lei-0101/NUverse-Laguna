import { Link } from 'react-router-dom'
import { Spinner } from '@/shared/components/ui'
import { paths } from '@/shared/routes/paths'
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../hooks/useNotifications'
import { NotificationItem } from './NotificationItem'

interface NotificationPanelProps {
  onClose: () => void
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { data, isLoading } = useNotifications(0)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()

  const notifications = data?.content ?? []
  const hasUnread = notifications.some((n) => !n.read)

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="flex w-80 flex-col rounded-xl border border-border bg-surface shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Notifications</span>
        {hasUnread && (
          <button
            type="button"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="text-xs text-primary hover:underline disabled:opacity-60"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[360px] overflow-y-auto" role="list">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-5 w-5 text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">You&apos;re all caught up</p>
        ) : (
          <div className="py-1">
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
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-border px-4 py-2">
          <Link
            to={paths.notifications}
            onClick={onClose}
            className="block text-center text-xs text-primary hover:underline"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  )
}
