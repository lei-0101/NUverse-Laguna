import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card } from '@/shared/components/ui'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import { toApiError } from '@/shared/lib/apiClient'
import { exchangeProductPath, reservationInvoicePath } from '@/shared/routes/paths'
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

export function ReservationCard({ reservation, page, onError }: ReservationCardProps) {
  const cancel = useCancelReservation(page)
  const isPending = reservation.status === 'PENDING'
  const [showConfirm, setShowConfirm] = useState(false)

  const handleCancel = () => {
    cancel.mutate(reservation.id, {
      onSuccess: () => setShowConfirm(false),
      onError: (err) => onError(toApiError(err).message),
    })
  }

  return (
    <>
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
          <Link
            to={reservationInvoicePath(reservation.id)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-amber-400/30 hover:bg-amber-500/8 hover:text-amber-600 dark:hover:text-amber-400"
          >
            View Invoice
          </Link>
          {isPending && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowConfirm(true)}
            >
              Cancel
            </Button>
          )}
        </div>
      </Card>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleCancel}
        title="Cancel reservation?"
        message="Your reserved item will be released back to stock. This cannot be undone."
        confirmLabel="Cancel reservation"
        cancelLabel="Keep it"
        variant="warning"
        isLoading={cancel.isPending}
      />
    </>
  )
}
