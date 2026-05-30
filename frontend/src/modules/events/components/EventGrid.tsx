import { EmptyState } from '@/shared/components/ui'
import type { EventCard as EventCardType } from '../types'
import { EventCard } from './EventCard'

function EventGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-2xl border border-border bg-surface p-4">
          <div className="skeleton h-36 w-full rounded-xl" />
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="flex gap-2">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface Props {
  events: EventCardType[]
  isLoading: boolean
  showStatus?: boolean
  emptyMessage?: string
}

export function EventGrid({ events, isLoading, showStatus = false, emptyMessage = 'No events found' }: Props) {
  if (isLoading) return <EventGridSkeleton />

  if (events.length === 0) {
    return (
      <EmptyState
        title="No events"
        description={emptyMessage}
        icon="📅"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} showStatus={showStatus} />
      ))}
    </div>
  )
}
