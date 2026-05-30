import { cn } from '@/shared/lib/cn'
import { formatReservationStatus } from '../schemas'
import type { ReservationStatus } from '../types'

const STATUS_STYLES: Record<ReservationStatus, string> = {
  PENDING: 'bg-primary/10 text-primary',
  FULFILLED: 'bg-success/10 text-success',
  CANCELLED: 'bg-surface-muted text-muted-foreground',
  EXPIRED: 'bg-danger/10 text-danger',
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        STATUS_STYLES[status],
      )}
    >
      {formatReservationStatus(status)}
    </span>
  )
}
