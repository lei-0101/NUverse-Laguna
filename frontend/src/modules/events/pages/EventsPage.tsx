import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Pagination, Alert } from '@/shared/components/ui'
import { useAuthStore } from '@/shared/store/authStore'
import { paths } from '@/shared/routes/paths'
import { useEvents } from '../hooks/useEvents'
import { EventGrid } from '../components/EventGrid'
import { useThemeStore } from '@/shared/store/themeStore'
import { cn } from '@/shared/lib/cn'
import type { EventCategory } from '../types'

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORIES: { value: EventCategory | 'ALL'; label: string; icon: React.ReactNode; accent: string; accentDark: string }[] = [
  {
    value: 'ALL',
    label: 'All Events',
    accent: '#7c3aed',
    accentDark: '#a78bfa',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 9h18" />
      </svg>
    ),
  },
  {
    value: 'ACADEMIC',
    label: 'Academic',
    accent: '#3b82f6',
    accentDark: '#60a5fa',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    value: 'CULTURAL',
    label: 'Cultural',
    accent: '#7c3aed',
    accentDark: '#a78bfa',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    value: 'SPORTS',
    label: 'Sports',
    accent: '#059669',
    accentDark: '#34d399',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M19.07 4.93l-4.24 4.24M9.17 14.83l-4.24 4.24" />
      </svg>
    ),
  },
  {
    value: 'SEMINAR',
    label: 'Seminar',
    accent: '#6366f1',
    accentDark: '#818cf8',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
  },
  {
    value: 'SOCIAL',
    label: 'Social',
    accent: '#f59e0b',
    accentDark: '#fbbf24',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    value: 'OTHER',
    label: 'Other',
    accent: '#6b7280',
    accentDark: '#9ca3af',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
      </svg>
    ),
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export function EventsPage() {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const user = useAuthStore((s) => s.user)
  const canCreate = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_FACULTY'

  const [activeCategory, setActiveCategory] = useState<EventCategory | 'ALL'>('ALL')
  const [upcomingOnly, setUpcomingOnly] = useState(true)
  const [page, setPage] = useState(0)

  const selectedCat = CATEGORIES.find((c) => c.value === activeCategory)!
  const heroAccent  = isDark ? selectedCat.accentDark : selectedCat.accent

  const { data, isLoading, isError } = useEvents({
    category: activeCategory === 'ALL' ? undefined : activeCategory,
    status:   'PUBLISHED',
    upcomingOnly,
    page,
    size: 12,
  })

  const handleCategory = (cat: EventCategory | 'ALL') => {
    setActiveCategory(cat)
    setPage(0)
  }

  const handleUpcomingToggle = () => {
    setUpcomingOnly((p) => !p)
    setPage(0)
  }

  return (
    <div className="flex flex-col gap-6 animate-[page-enter_0.3s_ease-out]">

      {/* ── EDITORIAL HERO ─────────────────────────────────────────── */}
      <div
        className="relative -mx-4 -mt-8 overflow-hidden sm:-mx-6"
        style={{
          transition: 'background 0.4s ease',
          background: isDark
            ? `radial-gradient(ellipse at 20% 70%, ${heroAccent}18 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, ${heroAccent}0c 0%, transparent 50%), #0a0d14`
            : `radial-gradient(ellipse at 20% 70%, ${heroAccent}14 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, ${heroAccent}0a 0%, transparent 50%), #f7f8fa`,
        }}
      >
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12] dark:opacity-[0.05]"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(circle, ${heroAccent}99 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
            transition: 'background-image 0.4s ease',
          }}
        />

        {/* Large BG letter */}
        <div
          className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none text-[160px] font-black leading-none opacity-[0.03]"
          aria-hidden="true"
          style={{ color: isDark ? '#fff' : heroAccent, transition: 'color 0.4s ease' }}
        >
          E
        </div>

        <div className="relative z-10 px-4 pt-8 pb-6 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            {/* Headline */}
            <div>
              <p
                className="mb-1.5 text-[10px] font-black uppercase tracking-[0.4em] transition-colors duration-300"
                style={{ color: heroAccent }}
              >
                Campus Life
              </p>
              <h1 className={cn(
                'text-4xl font-black leading-none tracking-tight sm:text-5xl',
                isDark ? 'text-white' : 'text-foreground',
              )}>
                Campus Events
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Discover, RSVP, and experience everything happening on campus.
              </p>

              {data && (
                <div
                  className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold backdrop-blur-sm transition-all duration-300"
                  style={{
                    background: isDark ? `${heroAccent}18` : `${heroAccent}0d`,
                    borderColor: isDark ? `${heroAccent}40` : `${heroAccent}25`,
                    color: heroAccent,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: heroAccent, animation: 'dot-pulse 2s ease-in-out infinite' }}
                  />
                  {data.totalElements} event{data.totalElements !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Link to={paths.myRsvps}>
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all hover:-translate-y-0.5',
                    isDark
                      ? 'border-white/12 bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/8'
                      : 'border-border bg-surface text-muted-foreground hover:text-foreground hover:shadow-sm',
                  )}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                  </svg>
                  My RSVPs
                </button>
              </Link>
              {canCreate && (
                <Link to={paths.eventsNew}>
                  <Button size="sm" className="gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Create Event
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Bottom rule */}
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 h-px"
          aria-hidden="true"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${heroAccent}50 40%, ${heroAccent}30 70%, transparent 100%)`,
            transition: 'background 0.4s ease',
          }}
        />
      </div>

      {/* ── CATEGORY FILTER ROW ─────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Category chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value
            const accent   = isDark ? cat.accentDark : cat.accent
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleCategory(cat.value)}
                className="shrink-0 flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-200 whitespace-nowrap"
                style={isActive ? {
                  background: `${accent}18`,
                  borderColor: `${accent}60`,
                  color: accent,
                } : {
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  color: isDark ? '#99a1b3' : '#5b6472',
                }}
              >
                <span style={{ color: isActive ? accent : undefined }}>{cat.icon}</span>
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Secondary filter row */}
        <div className="flex items-center gap-3">
          {/* Upcoming toggle */}
          <button
            type="button"
            onClick={handleUpcomingToggle}
            className={cn(
              'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all',
              upcomingOnly
                ? isDark
                  ? 'border-primary/50 bg-primary/15 text-primary'
                  : 'border-primary/40 bg-primary/8 text-primary'
                : isDark
                  ? 'border-white/10 bg-white/4 text-muted-foreground hover:border-white/20'
                  : 'border-border bg-surface text-muted-foreground hover:border-border/80',
            )}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            Upcoming only
          </button>

          {!upcomingOnly && (
            <span className="text-[10px] text-muted-foreground font-medium">
              Showing all events, including past
            </span>
          )}
        </div>
      </div>

      {isError && (
        <Alert variant="error">Failed to load events. Please try again.</Alert>
      )}

      {/* ── EVENT GRID ─────────────────────────────────────────────── */}
      <EventGrid
        events={data?.content ?? []}
        isLoading={isLoading}
        emptyMessage={
          upcomingOnly
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
