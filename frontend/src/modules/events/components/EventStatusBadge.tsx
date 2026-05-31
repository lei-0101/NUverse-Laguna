import { cn } from '@/shared/lib/cn'
import type { EventStatus } from '../types'

const STATUS_STYLES: Record<EventStatus, string> = {
  DRAFT:     'bg-surface-muted text-muted-foreground border border-border',
  PUBLISHED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  CANCELLED: 'bg-danger/10 text-danger',
  ARCHIVED:  'bg-surface-muted text-muted-foreground border border-border',
}

const STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT:     'Draft',
  PUBLISHED: 'Published',
  CANCELLED: 'Cancelled',
  ARCHIVED:  'Archived',
}

interface Props {
  status: EventStatus
  className?: string
}

export function EventStatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
