import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Pagination, Alert } from '@/shared/components/ui'
import { useAuthStore } from '@/shared/store/authStore'
import { paths } from '@/shared/routes/paths'
import { useEvents } from '../hooks/useEvents'
import { EventGrid } from '../components/EventGrid'
import { EventFilters, type EventFiltersValue } from '../components/EventFilters'
import { useThemeStore } from '@/shared/store/themeStore'

/* Map category → hero gradient colors */
const CATEGORY_HERO: Record<string, string> = {
  ACADEMIC: 'rgba(59,130,246,0.18), rgba(6,182,212,0.12)',
  CULTURAL: 'rgba(168,85,247,0.18), rgba(236,72,153,0.12)',
  SPORTS:   'rgba(34,197,94,0.18), rgba(16,185,129,0.12)',
  SEMINAR:  'rgba(99,102,241,0.18), rgba(59,130,246,0.12)',
  SOCIAL:   'rgba(249,115,22,0.18), rgba(236,72,153,0.12)',
  OTHER:    'rgba(100,116,139,0.14), rgba(71,85,105,0.10)',
}
const DEFAULT_HERO = 'rgba(74,110,232,0.15), rgba(167,139,250,0.10)'

/** Browse campus events with filter and pagination. */
export function EventsPage() {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ROLE_ADMIN'
  const isFaculty = user?.role === 'ROLE_FACULTY'
  const canCreate = isAdmin || isFaculty

  const [filters, setFilters] = useState<EventFiltersValue>({ status: 'PUBLISHED', upcomingOnly: true })
  const [page, setPage] = useState(0)

  const { data, isLoading, isError } = useEvents({
    ...filters,
    page,
    size: 12,
  })

  const handleFilterChange = (f: EventFiltersValue) => {
    setFilters(f)
    setPage(0)
  }

  const heroPair = (filters.category && CATEGORY_HERO[filters.category]) ?? DEFAULT_HERO
  const [c1, c2] = heroPair.split(', ')

  return (
    <div className="flex flex-col gap-6 animate-[page-enter_0.3s_ease-out]">
      {/* ── Atmospheric header ──────────────────────────────────────── */}
      <div
        className="relative -mx-4 -mt-8 overflow-hidden px-4 pt-8 pb-6 sm:-mx-6 sm:px-6"
        style={{
          background: `radial-gradient(ellipse at 20% 60%, ${c1} 0%, transparent 55%),
                       radial-gradient(ellipse at 80% 30%, ${c2} 0%, transparent 55%),
                       ${isDark ? '#0a0d14' : 'transparent'}`,
          transition: 'background 0.4s ease',
        }}
      >
        {/* Dot grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 dark:hidden"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(74,110,232,0.15) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            opacity: 0.4,
          }}
        />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: isDark ? '#a78bfa' : '#4a6ee8' }}>
              Campus Life
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Campus Events
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Discover, RSVP, and experience everything happening on campus.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 mt-1">
            <Link to={paths.myRsvps}>
              <Button variant="secondary" size="sm">My RSVPs</Button>
            </Link>
            {canCreate && (
              <Link to={paths.eventsNew}>
                <Button size="sm">+ Create</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Event count pill */}
        {data && (
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            {data.totalElements} event{data.totalElements !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      <EventFilters value={filters} onChange={handleFilterChange} />

      {isError && (
        <Alert variant="error">Failed to load events. Please try again.</Alert>
      )}

      <EventGrid
        events={data?.content ?? []}
        isLoading={isLoading}
        emptyMessage={
          filters.upcomingOnly
            ? 'No upcoming events right now. Check back soon!'
            : 'No events match your filters.'
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          page={data.number}
          totalPages={data.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
