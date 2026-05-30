import { Link } from 'react-router-dom'
import { Button, Card } from '@/shared/components/ui'
import { toApiError } from '@/shared/lib/apiClient'
import { exchangeProductPath } from '@/shared/routes/paths'
import { formatPrice, formatVariantLabel } from '../schemas'
import type { Reservation } from '../types'
import { ReservationStatusBadge } from './ReservationStatusBadge'
import { ReservationCountdown } from './ReservationCountdown'
import { useCancelReservation } from '../hooks/useBulldogExchange'

interface ReservationCardProps {
  reservation: Reservation
  page: number
  onError: (message: string) => void
}

/** Shows a single reservation with its status, variant info, and cancel action. */
export function ReservationCard({ reservation, page, onError }: ReservationCardProps) {
  const cancel = useCancelReservation(page)
  const isPending = reservation.status === 'PENDING'

  const handleCancel = () => {
    if (!window.confirm('Cancel this reservation? Stock will be restored.')) return
    cancel.mutate(reservation.id, {
      onError: (err) => onError(toApiError(err).message),
    })
  }

  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <ReservationStatusBadge status={reservation.status} />
          <Link
            to={exchangeProductPath(reservation.productId)}
            className="text-sm font-semibold text-foreground hover:text-primary"
          >
            {reservation.productName}
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatVariantLabel(reservation.size, reservation.color)} · SKU: {reservation.sku}
        </p>
        <p className="text-base font-semibold text-foreground">
          {formatPrice(reservation.price)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        {isPending && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Pick up within</p>
            <ReservationCountdown expiresAt={reservation.expiresAt} />
          </div>
        )}
        {isPending && (
          <Button
            variant="danger"
            size="sm"
            isLoading={cancel.isPending}
            onClick={handleCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </Card>
  )
}
