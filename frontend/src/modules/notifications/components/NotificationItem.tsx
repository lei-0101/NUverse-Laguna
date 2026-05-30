import { useNavigate } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { userProfilePath, eventDetailPath } from '@/shared/routes/paths'
import type { Notification, ReferenceType } from '../types'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function buildNavTarget(referenceId: string, referenceType: ReferenceType): string | null {
  switch (referenceType) {
    case 'USER_PROFILE': return userProfilePath(referenceId)
    case 'EVENT':        return eventDetailPath(referenceId)
    case 'RESERVATION':  return '/exchange/reservations'
    default:             return null
  }
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const navigate = useNavigate()

  const navTarget =
    notification.referenceId && notification.referenceType
      ? buildNavTarget(notification.referenceId, notification.referenceType)
      : null

  const handleClick = () => {
    if (!notification.read) onMarkAsRead(notification.id)
    if (navTarget) navigate(navTarget)
  }

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg px-3 py-3 transition-colors',
        notification.read ? 'hover:bg-surface-muted' : 'bg-primary/5 hover:bg-primary/10',
        navTarget && 'cursor-pointer',
      )}
      role="listitem"
      onClick={navTarget ? handleClick : undefined}
    >
      {/* Unread dot */}
      <span
        aria-hidden="true"
        className={cn(
          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
          notification.read ? 'bg-transparent' : 'bg-primary',
        )}
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground leading-snug">{notification.title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground leading-snug">{notification.body}</p>
        <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt)}</p>
        {navTarget && (
          <p className="mt-1 text-xs font-medium text-primary">Tap to view →</p>
        )}
      </div>

      {/* Action buttons — visible on hover / focus-within */}
      <div
        className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {!notification.read && (
          <button
            type="button"
            aria-label="Mark as read"
            onClick={() => onMarkAsRead(notification.id)}
            className="rounded p-1 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            title="Mark as read"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <button
          type="button"
          aria-label="Delete notification"
          onClick={() => onDelete(notification.id)}
          className="rounded p-1 text-muted-foreground hover:bg-surface-muted hover:text-danger"
          title="Delete"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4L4 12M4 4l8 8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
