import { useState } from 'react'
import { Alert, EmptyState, Loader } from '@/shared/components/ui'
import { Pagination } from '@/shared/components/ui'
import { useMyReservations } from '../hooks/useBulldogExchange'
import { ReservationCard } from '../components/ReservationCard'

/** Paginated list of the authenticated user's reservations. */
export function MyReservationsPage() {
  const [page, setPage] = useState(0)
  const [error, setError] = useState<string>()
  const { data, isLoading, isError } = useMyReservations(page)

  return (
    <div className="space-y-6 animate-[page-enter_0.3s_ease-out]">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Reservations</h1>
        <p className="text-sm text-muted-foreground">
          Pending items must be picked up within 48 hours.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {isLoading && <Loader label="Loading reservations…" />}
      {isError && (
        <Alert variant="error">We couldn't load your reservations. Please try again.</Alert>
      )}

      {data && data.content.length === 0 && (
        <EmptyState
          title="No reservations yet"
          description="Reserve a Bulldog Exchange item and it will appear here."
        />
      )}

      {data && data.content.length > 0 && (
        <div className="space-y-3">
          {data.content.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              page={page}
              onError={setError}
            />
          ))}
          <Pagination
            page={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
