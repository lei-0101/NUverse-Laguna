import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, EmptyState, Loader, Pagination } from '@/shared/components/ui'
import { eventDetailPath, paths } from '@/shared/routes/paths'
import { useMyRsvps } from '../hooks/useEvents'
import { EventStatusBadge } from '../components/EventStatusBadge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function MyRsvpsPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading, isError } = useMyRsvps(page)

  return (
    <div className="space-y-6 animate-[page-enter_0.3s_ease-out]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My RSVPs</h1>
          <p className="text-sm text-muted-foreground">Events you&apos;ve registered to attend.</p>
        </div>
        <Link to={paths.events} className="text-sm text-muted-foreground hover:text-foreground">
          ← Browse events
        </Link>
      </div>

      {isError && <Alert variant="error">Failed to load your RSVPs.</Alert>}

      {isLoading && <Loader label="Loading your RSVPs…" />}

      {!isLoading && data?.content.length === 0 && (
        <EmptyState
          title="No RSVPs yet"
          description="Find campus events and register to see them here."
          icon="🎟"
          action={<Link to={paths.events} className="text-sm font-medium text-primary hover:underline">Browse Events</Link>}
        />
      )}

      {data && data.content.length > 0 && (
        <div className="space-y-3">
          {data.content.map((rsvp) => (
            <Link
              key={rsvp.rsvpId}
              to={eventDetailPath(rsvp.eventId)}
              className="block rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-foreground">{rsvp.eventTitle}</h3>
                  <p className="mt-1 truncate text-xs text-muted-foreground">📍 {rsvp.eventLocation}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">🗓 {formatDate(rsvp.eventStartTime)}</p>
                </div>
                <EventStatusBadge status={rsvp.eventStatus} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <Pagination page={data.number} totalPages={data.totalPages} onPageChange={setPage} />
      )}
    </div>
  )
}
