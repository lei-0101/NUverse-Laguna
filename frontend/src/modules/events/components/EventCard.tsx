import { Link } from 'react-router-dom'
import { Card } from '@/shared/components/ui'
import { cn } from '@/shared/lib/cn'
import { eventDetailPath } from '@/shared/routes/paths'
import type { EventCard as EventCardType } from '../types'
import { EventCategoryBadge } from './EventCategoryBadge'
import { EventStatusBadge } from './EventStatusBadge'

const CATEGORY_ACCENT: Record<string, string> = {
  ACADEMIC: 'from-blue-400 to-cyan-400',
  CULTURAL: 'from-purple-400 to-pink-400',
  SPORTS:   'from-green-400 to-emerald-500',
  SEMINAR:  'from-indigo-400 to-blue-500',
  SOCIAL:   'from-orange-400 to-pink-400',
  OTHER:    'from-gray-400 to-slate-400',
}

function formatEventDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface Props {
  event: EventCardType
  showStatus?: boolean
}

export function EventCard({ event, showStatus = false }: Props) {
  const isFull = event.capacity !== null && event.rsvpCount >= event.capacity
  const isUpcoming = new Date(event.startTime) > new Date()

  const accentGrad = CATEGORY_ACCENT[event.category] ?? CATEGORY_ACCENT.OTHER

  return (
    <Link to={eventDetailPath(event.id)} className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
      <Card className="group relative flex h-full flex-col overflow-hidden group-hover:-translate-y-1.5 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10">
        {/* Category accent top strip */}
        <div className={cn('absolute inset-x-0 top-0 h-0.5 z-10 bg-gradient-to-r', accentGrad)} />
        {/* Cover image or placeholder */}
        <div className="relative h-40 w-full overflow-hidden bg-surface-muted">
          {event.coverImageUrl ? (
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-4xl" aria-hidden>📅</span>
            </div>
          )}
          {showStatus && (
            <div className="absolute right-2 top-2">
              <EventStatusBadge status={event.status} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <EventCategoryBadge category={event.category} className="shrink-0" />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span aria-hidden>📍</span>
            <span className="truncate">{event.location}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span aria-hidden>🗓</span>
            <span>{formatEventDate(event.startTime)}</span>
          </div>

          <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <span>
              {event.rsvpCount} attending
              {event.capacity !== null && (
                <span className={cn(isFull && 'text-danger font-medium')}>
                  {' '}/ {event.capacity}
                </span>
              )}
            </span>
            {isUpcoming && event.status === 'PUBLISHED' && (
              <span className={cn('font-medium', isFull ? 'text-danger' : 'text-success')}>
                {isFull ? 'Full' : 'Open'}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
