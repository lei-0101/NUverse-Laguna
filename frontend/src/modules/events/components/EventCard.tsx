import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/components/ui'
import { eventDetailPath } from '@/shared/routes/paths'
import type { EventCard as EventCardType } from '../types'
import { EventStatusBadge } from './EventStatusBadge'

/* Category left-border color + soft background tint */
const CATEGORY_CONFIG: Record<string, {
  border:  string
  bgLight: string
  bgDark:  string
  icon:    string
  badge:   Parameters<typeof Badge>[0]['color']
}> = {
  ACADEMIC: { border: 'border-l-blue-400',   bgLight: 'hover:bg-blue-50/60',   bgDark: 'dark:hover:bg-blue-950/20',   icon: '🎓', badge: 'blue'   },
  CULTURAL: { border: 'border-l-violet-400', bgLight: 'hover:bg-violet-50/60', bgDark: 'dark:hover:bg-violet-950/20', icon: '🎭', badge: 'violet' },
  SPORTS:   { border: 'border-l-emerald-400',bgLight: 'hover:bg-emerald-50/60',bgDark: 'dark:hover:bg-emerald-950/20',icon: '🏆', badge: 'emerald'},
  SEMINAR:  { border: 'border-l-indigo-400', bgLight: 'hover:bg-indigo-50/60', bgDark: 'dark:hover:bg-indigo-950/20', icon: '📊', badge: 'blue'   },
  SOCIAL:   { border: 'border-l-amber-400',  bgLight: 'hover:bg-amber-50/60',  bgDark: 'dark:hover:bg-amber-950/20',  icon: '🎉', badge: 'amber'  },
  OTHER:    { border: 'border-l-gray-300',   bgLight: 'hover:bg-gray-50/60',   bgDark: 'dark:hover:bg-gray-900/20',   icon: '📌', badge: 'gray'   },
}

const CATEGORY_LABEL: Record<string, string> = {
  ACADEMIC: 'Academic', CULTURAL: 'Cultural', SPORTS: 'Sports',
  SEMINAR: 'Seminar', SOCIAL: 'Social', OTHER: 'Other',
}

function formatEventDate(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
  }
}

function isCountdownNeeded(iso: string): { show: boolean; label: string } {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0 || diff > 24 * 60 * 60 * 1000) return { show: false, label: '' }
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  return { show: true, label: h > 0 ? `Starts in ${h}h ${m}m` : `Starts in ${m}m` }
}

interface Props {
  event:       EventCardType
  showStatus?: boolean
}

export function EventCard({ event, showStatus = false }: Props) {
  const isFull     = event.capacity != null && event.rsvpCount >= event.capacity
  const isUpcoming = new Date(event.startTime) > new Date()
  const cfg        = CATEGORY_CONFIG[event.category] ?? CATEGORY_CONFIG.OTHER
  const { date, time } = formatEventDate(event.startTime)
  const countdown  = isCountdownNeeded(event.startTime)

  return (
    <Link
      to={eventDetailPath(event.id)}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-border border-l-4 bg-surface',
        'transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]',
        cfg.border, cfg.bgLight, cfg.bgDark,
      )}
    >
      {/* Cover image */}
      <div className="relative h-40 w-full overflow-hidden bg-surface-muted">
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl opacity-30" aria-hidden="true">
            {cfg.icon}
          </div>
        )}

        {/* Status overlay */}
        {showStatus && (
          <div className="absolute right-2.5 top-2.5">
            <EventStatusBadge status={event.status} />
          </div>
        )}

        {/* Countdown chip */}
        {countdown.show && (
          <div className="absolute left-2.5 top-2.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600 dark:border-red-800 dark:bg-red-950/60 dark:text-red-400"
              style={{ animation: 'dot-pulse 1.6s ease-in-out infinite' }}>
              ● {countdown.label}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {/* Category + title */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
            {event.title}
          </h3>
          <Badge variant="soft" color={cfg.badge} size="sm" className="shrink-0">
            {CATEGORY_LABEL[event.category] ?? event.category}
          </Badge>
        </div>

        {/* Meta */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <rect x="2" y="3" width="12" height="12" rx="2" /><path d="M5 1v3M11 1v3M2 7h12" />
            </svg>
            {date} · {time}
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M8 1.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM8 14v1M3 8H1.5M14.5 8H13" />
              <circle cx="8" cy="6.5" r="1.5" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Attendance bar */}
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
              {event.capacity != null && (
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    isFull ? 'bg-danger' : 'bg-primary/60',
                  )}
                  style={{ width: `${Math.min((event.rsvpCount / event.capacity) * 100, 100)}%` }}
                />
              )}
            </div>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground whitespace-nowrap">
              {event.rsvpCount}{event.capacity != null ? ` / ${event.capacity}` : ''} going
            </span>
          </div>
          {isUpcoming && event.status === 'PUBLISHED' && (
            <Badge
              variant="soft"
              color={isFull ? 'red' : 'success'}
              size="sm"
            >
              {isFull ? 'Full' : 'Open'}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}
