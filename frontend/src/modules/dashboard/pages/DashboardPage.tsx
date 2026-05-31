import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/shared/store/authStore'
import { eventsApi } from '@/modules/events/services/eventsApi'
import { marketplaceApi } from '@/modules/marketplace/services/marketplaceApi'
import { chibiApi } from '@/modules/chibi/services/chibiApi'
import { paths, eventDetailPath, marketplaceListingPath } from '@/shared/routes/paths'
import { cn } from '@/shared/lib/cn'
import { useThemeStore } from '@/shared/store/themeStore'

// ── Time helpers ─────────────────────────────────────────────────────────────

function getTimeContext(): {
  greeting: string
  period: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night'
  sub: string
} {
  const h = new Date().getHours()
  if (h < 5)  return { greeting: 'Good night',     period: 'night',     sub: 'Late-night campus mode.' }
  if (h < 10) return { greeting: 'Good morning',   period: 'morning',   sub: 'Fresh start. Here\'s what\'s on campus.' }
  if (h < 12) return { greeting: 'Good morning',   period: 'dawn',      sub: 'Midmorning — events and listings await.' }
  if (h < 17) return { greeting: 'Good afternoon', period: 'afternoon', sub: 'Afternoon energy. Let\'s see what\'s happening.' }
  if (h < 20) return { greeting: 'Good evening',   period: 'evening',   sub: 'Wind down with campus happenings.' }
  return              { greeting: 'Good evening',   period: 'night',     sub: 'Late hours. Browse safely, Bulldog.' }
}

// Using inline CSS backgrounds (not Tailwind utilities) to prevent purging of
// dynamically-assembled class strings in the production build.
const PERIOD_LIGHT: Record<string, { bg: string; accent: string }> = {
  dawn:      { bg: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 45%, #eef2ff 100%)', accent: '#1f3a8a' },
  morning:   { bg: 'linear-gradient(135deg, #fffbeb 0%, #fff7ed 45%, #fefce8 100%)', accent: '#1f3a8a' },
  afternoon: { bg: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 45%, #f5f3ff 100%)', accent: '#1f3a8a' },
  evening:   { bg: 'linear-gradient(135deg, #f5f3ff 0%, #faf5ff 45%, #eef2ff 100%)', accent: '#1f3a8a' },
  night:     { bg: 'linear-gradient(135deg, #eef2ff 0%, #e8eeff 45%, #f0f4ff 100%)', accent: '#1f3a8a' },
}

const PERIOD_DARK: Record<string, { accent: string }> = {
  dawn:      { accent: '#38bdf8' },
  morning:   { accent: '#fbbf24' },
  afternoon: { accent: '#818cf8' },
  evening:   { accent: '#a78bfa' },
  night:     { accent: '#60a5fa' },
}


function formatFullDate() {
  return new Date().toLocaleDateString('en-PH', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).toUpperCase()
}

function formatEventDate(iso: string) {
  const d = new Date(iso)
  return {
    day:   d.toLocaleDateString('en-PH', { weekday: 'short' }).toUpperCase(),
    date:  d.getDate(),
    month: d.toLocaleDateString('en-PH', { month: 'short' }).toUpperCase(),
    time:  d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
  }
}

function formatPrice(n: number) {
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`
}

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORY_BARS: Record<string, { bg: string; text: string; dot: string }> = {
  ACADEMIC: { bg: 'bg-blue-500',    text: 'text-blue-600 dark:text-blue-400',   dot: 'bg-blue-500'   },
  CULTURAL: { bg: 'bg-violet-500',  text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500' },
  SPORTS:   { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  SEMINAR:  { bg: 'bg-indigo-500',  text: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-500' },
  SOCIAL:   { bg: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400',  dot: 'bg-amber-500'  },
  OTHER:    { bg: 'bg-gray-400',    text: 'text-gray-500 dark:text-gray-400',    dot: 'bg-gray-400'   },
}

const CONDITION_BADGE: Record<string, string> = {
  NEW:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  LIKE_NEW: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  GOOD:     'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  FAIR:     'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
}

const CONDITION_LABEL: Record<string, string> = {
  NEW: 'New', LIKE_NEW: 'Like New', GOOD: 'Good', FAIR: 'Fair',
}

// ── Module config ─────────────────────────────────────────────────────────────

const MODULES = [
  {
    id: 'marketplace',
    label: 'Marketplace',
    tagline: 'Buy & sell on campus',
    to: paths.marketplace,
    accent: '#059669',
    accentDark: '#34d399',
    bg: 'rgba(5,150,105,0.08)',
    bgHover: 'rgba(5,150,105,0.14)',
    border: 'rgba(5,150,105,0.25)',
    span: 'lg:col-span-2',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="24" height="18" rx="3" />
        <path d="M8 6V5a6 6 0 0 1 12 0v1" />
        <path d="M10 13h8M10 17h5" />
      </svg>
    ),
  },
  {
    id: 'exchange',
    label: 'Bulldog Exchange',
    tagline: 'Official NU merchandise',
    to: paths.exchange,
    accent: '#d97706',
    accentDark: '#fbbf24',
    bg: 'rgba(217,119,6,0.08)',
    bgHover: 'rgba(217,119,6,0.14)',
    border: 'rgba(217,119,6,0.25)',
    span: 'lg:col-span-1',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h20v4H4zM4 8v14a2 2 0 002 2h16a2 2 0 002-2V8" />
        <path d="M10 8v2a4 4 0 008 0V8" />
      </svg>
    ),
  },
  {
    id: 'events',
    label: 'Campus Events',
    tagline: 'RSVP to events',
    to: paths.events,
    accent: '#7c3aed',
    accentDark: '#a78bfa',
    bg: 'rgba(124,58,237,0.08)',
    bgHover: 'rgba(124,58,237,0.14)',
    border: 'rgba(124,58,237,0.25)',
    span: 'lg:col-span-1',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="22" height="20" rx="3" />
        <path d="M18 3v4M10 3v4M3 11h22" />
        <path d="M8 16h3M17 16h3M8 20h3M17 20h3" />
      </svg>
    ),
  },
  {
    id: 'lostfound',
    label: 'Lost & Found',
    tagline: 'Community board',
    to: paths.lostFound,
    accent: '#b45309',
    accentDark: '#fbbf24',
    bg: 'rgba(180,83,9,0.08)',
    bgHover: 'rgba(180,83,9,0.14)',
    border: 'rgba(180,83,9,0.25)',
    span: 'lg:col-span-1',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13" cy="13" r="9" />
        <path d="M22 22l4 4" />
        <path d="M10 10.5a3 3 0 014.5 2.6 3 3 0 01-3 3" />
        <circle cx="13.5" cy="19" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'inspire',
    label: 'Inspire Sports',
    tagline: 'Join the academy',
    to: paths.inspire,
    accent: '#dc2626',
    accentDark: '#f87171',
    bg: 'rgba(220,38,38,0.08)',
    bgHover: 'rgba(220,38,38,0.14)',
    border: 'rgba(220,38,38,0.25)',
    span: 'lg:col-span-1',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4L5 22h18L14 4z" />
        <path d="M9 22V16a5 5 0 0110 0v6" />
      </svg>
    ),
  },
]

const NUIS_LINK = {
  id: 'nuis',
  label: 'NUIS Portal',
  tagline: 'Student info system',
  href: paths.nuis,
  accent: '#4b5563',
  accentDark: '#9ca3af',
  bg: 'rgba(75,85,99,0.08)',
  bgHover: 'rgba(75,85,99,0.14)',
  border: 'rgba(75,85,99,0.25)',
  icon: (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="14" r="11" />
      <path d="M14 3C10 7 8 10.5 8 14s2 7 6 11" />
      <path d="M14 3c4 4 6 7.5 6 11s-2 7-6 11" />
      <path d="M3 14h22" />
      <path d="M3 9h22M3 19h22" />
    </svg>
  ),
}

const MS365_LINKS = [
  {
    id: 'outlook',
    label: 'Outlook',
    tagline: 'NU email & calendar',
    href: 'https://outlook.office365.com',
    accent: '#0078d4',
    accentDark: '#60a5fa',
    bg: 'rgba(0,120,212,0.07)',
    bgHover: 'rgba(0,120,212,0.13)',
    border: 'rgba(0,120,212,0.22)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 8l10 7 10-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'teams',
    label: 'MS Teams',
    tagline: 'Classes & collaboration',
    href: 'https://teams.microsoft.com',
    accent: '#6264a7',
    accentDark: '#a78bfa',
    bg: 'rgba(98,100,167,0.07)',
    bgHover: 'rgba(98,100,167,0.13)',
    border: 'rgba(98,100,167,0.22)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 20v-1c0-3.31 2.69-6 6-6s6 2.69 6 6v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="16" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M20 18v-.5c0-2.5-1.8-4.5-4-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function ModuleCard({
  label, tagline, to, accent, accentDark, bg, bgHover, border, span, icon,
}: typeof MODULES[0]) {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const activeAccent = isDark ? accentDark : accent

  return (
    <Link
      to={to}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5',
        'transition-all duration-250 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]',
        span,
      )}
      style={{
        background: bg,
        borderColor: border,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = bgHover }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = bg }}
    >
      {/* Decorative corner circle */}
      <div
        className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-[0.07]"
        style={{ background: activeAccent }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-start justify-between">
        {/* Icon */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
          style={{ background: `${activeAccent}18`, color: activeAccent }}
        >
          {icon}
        </div>
        {/* Arrow */}
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5"
          style={{ color: activeAccent, background: `${activeAccent}18` }}
          aria-hidden="true"
        >
          →
        </span>
      </div>

      <div className="relative z-10 mt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: activeAccent }}>
          {tagline}
        </p>
        <h3 className="mt-1 text-base font-bold text-foreground group-hover:text-foreground transition-colors">
          {label}
        </h3>
      </div>
    </Link>
  )
}

function Ms365Card({
  label, tagline, href, accent, accentDark, bg, bgHover, border, icon,
}: { label: string; tagline: string; href: string; accent: string; accentDark: string; bg: string; bgHover: string; border: string; icon: React.ReactNode }) {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const activeAccent = isDark ? accentDark : accent
  const isExternal = href.startsWith('http')

  const inner = (
    <>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
        style={{ background: `${activeAccent}18`, color: activeAccent }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{tagline}</p>
      </div>
      <svg
        width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        className="shrink-0 opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0.5"
        style={{ color: activeAccent }}
      >
        <path d="M1 7h10.5M7.5 3l4 4-4 4" />
        <path d="M12 1h1v2" strokeOpacity=".4" />
      </svg>
    </>
  )

  const cls = "group relative flex items-center gap-3 overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        style={{ background: bg, borderColor: border }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = bgHover }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = bg }}
      >
        {inner}
      </a>
    )
  }

  return (
    <Link
      to={href}
      className={cls}
      style={{ background: bg, borderColor: border }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = bgHover }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = bg }}
    >
      {inner}
    </Link>
  )
}

function EventRow({ event }: {
  event: {
    id: string; title: string; category: string
    location: string; startTime: string; rsvpCount: number; capacity: number | null
  }
}) {
  const { day, date, month, time } = formatEventDate(event.startTime)
  const cfg = CATEGORY_BARS[event.category] ?? CATEGORY_BARS.OTHER
  const isFull = event.capacity != null && event.rsvpCount >= event.capacity

  return (
    <Link
      to={eventDetailPath(event.id)}
      className="group flex items-stretch gap-0 overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] hover:border-border/70"
    >
      {/* Category color bar */}
      <div className={cn('w-1 shrink-0', cfg.bg)} aria-hidden="true" />

      {/* Date column */}
      <div className="flex w-16 shrink-0 flex-col items-center justify-center gap-0 border-r border-border py-3.5">
        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">{day}</span>
        <span className="text-2xl font-black leading-none text-foreground">{date}</span>
        <span className={cn('text-[9px] font-black uppercase tracking-[0.15em]', cfg.text)}>{month}</span>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-3.5 py-3">
        <p className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {event.title}
        </p>
        <p className="text-xs text-muted-foreground">{time} · {event.location}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className={cn('text-[10px] font-bold uppercase tracking-wider', cfg.text)}>
            {event.category}
          </span>
          <span className="text-[10px] text-muted-foreground">{event.rsvpCount} going</span>
          {isFull && (
            <span className="rounded-full bg-danger/10 px-1.5 py-0.5 text-[9px] font-bold text-danger">
              FULL
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function ListingRow({ listing }: {
  listing: {
    id: string; title: string; price: number; condition: string
    thumbnailUrl: string | null; seller: { fullName: string }
  }
}) {
  return (
    <Link
      to={marketplaceListingPath(listing.id)}
      className="group flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-surface p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
    >
      {/* Thumbnail */}
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
        {listing.thumbnailUrl ? (
          <img
            src={listing.thumbnailUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-25">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {listing.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="font-mono tabular-nums text-sm font-bold text-[var(--color-module-marketplace)]">
            {formatPrice(listing.price)}
          </span>
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
              CONDITION_BADGE[listing.condition] ?? 'bg-gray-100 text-gray-600',
            )}
          >
            {CONDITION_LABEL[listing.condition] ?? listing.condition}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{listing.seller.fullName}</p>
      </div>

      <div
        className="shrink-0 text-muted-foreground opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0.5"
        aria-hidden="true"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M2.5 7h9M7.5 3l4 4-4 4" />
        </svg>
      </div>
    </Link>
  )
}

function XpMiniBar({ xp, level, xpForCurrentLevel, xpForNextLevel }: {
  xp: number; level: number; xpForCurrentLevel: number; xpForNextLevel: number
}) {
  const isMax = level >= 20
  const progress = isMax
    ? 100
    : Math.round(((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100)

  return (
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            Level {level}
          </span>
          <span className="font-mono text-[10px] font-bold text-accent tabular-nums">
            {xp.toLocaleString()} XP
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export function DashboardPage() {
  const user    = useAuthStore((s) => s.user)
  const isDark  = useThemeStore((s) => s.theme === 'dark')
  const { greeting, period, sub } = getTimeContext()
  const firstName = user?.fullName.split(' ')[0] ?? 'there'

  const { data: eventsData } = useQuery({
    queryKey: ['events', 'upcoming', 'dashboard'],
    queryFn:  () => eventsApi.getEvents({ status: 'PUBLISHED', upcomingOnly: true, size: 5 }),
    staleTime: 2 * 60 * 1000,
  })

  const { data: listingsData } = useQuery({
    queryKey: ['marketplace', 'recent', 'dashboard'],
    queryFn:  () => marketplaceApi.getListings({}, 0, 6),
    staleTime: 2 * 60 * 1000,
  })

  const { data: chibiData } = useQuery({
    queryKey: ['chibi', 'me'],
    queryFn:  chibiApi.getMyProfile,
    staleTime: 5 * 60 * 1000,
  })

  const periodLight  = PERIOD_LIGHT[period]
  const periodDark   = PERIOD_DARK[period]
  const accentColor  = isDark ? periodDark.accent : periodLight.accent
  const upcomingEvents = eventsData?.content  ?? []
  const recentListings = listingsData?.content ?? []

  return (
    <div className="flex flex-col gap-6 animate-[page-enter_0.3s_ease-out]">

      {/* ── EDITORIAL HERO ───────────────────────────────────────────── */}
      <div
        className="relative -mx-4 -mt-8 overflow-hidden px-6 pt-10 pb-8 sm:-mx-6 sm:px-10 sm:pt-12 sm:pb-10"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 10% 50%, rgba(74,110,232,0.12) 0%, transparent 55%),' +
              'radial-gradient(ellipse at 85% 20%, rgba(245,179,0,0.07) 0%, transparent 50%),' +
              '#0a0d14'
            : periodLight.bg,
        }}
      >
        {/* Dot grid — light mode only */}
        {!isDark && (
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            aria-hidden="true"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(31,58,138,0.4) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        )}

        {/* Decorative large watermark letter */}
        <div
          className="pointer-events-none absolute -right-6 -bottom-10 select-none text-[200px] font-black leading-none opacity-[0.03]"
          aria-hidden="true"
          style={{ color: isDark ? '#ffffff' : '#1f3a8a' }}
        >
          N
        </div>

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          {/* Left: greeting */}
          <div className="max-w-xl">
            {/* Eyebrow */}
            <p
              className="mb-2 text-[10px] font-black uppercase tracking-[0.35em]"
              style={{ color: accentColor }}
            >
              {formatFullDate()}
            </p>

            {/* Massive headline */}
            <h1 className={cn(
              'text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl',
              isDark ? 'text-white' : 'text-foreground',
            )}>
              {greeting},<br />
              <span style={{ color: accentColor }}>{firstName}.</span>
            </h1>

            <p className={cn('mt-3 text-sm sm:text-base font-medium', isDark ? 'text-white/60' : 'text-foreground/75')}>
              {sub}
            </p>
          </div>

          {/* Right: user card + XP */}
          <div className="flex flex-col items-end gap-3">
            {/* Role badge */}
            {user && (
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]',
                  isDark
                    ? 'border-white/15 text-white/60 bg-white/5'
                    : 'border-border text-muted-foreground bg-white/70',
                )}
              >
                {user.role.replace('ROLE_', '')}
              </span>
            )}

            {/* XP mini widget */}
            {chibiData && (
              <Link
                to={paths.chibi}
                className={cn(
                  'group flex w-52 items-center gap-3 rounded-xl border p-3 transition-all hover:-translate-y-0.5',
                  isDark
                    ? 'border-white/10 bg-white/5 hover:bg-white/8'
                    : 'border-border bg-white/70 hover:bg-white hover:shadow-sm backdrop-blur-sm',
                )}
              >
                {/* Chibi mini avatar */}
                <div className="relative shrink-0">
                  <svg width="36" height="36" viewBox="0 0 120 120" className="chibi-root" style={{ animationDuration: '3s' }}>
                    <ellipse cx="60" cy="80" rx="28" ry="22" fill="#f0b870" />
                    <circle cx="60" cy="52" r="26" fill="#f5c58a" />
                    <circle cx="50" cy="49" r="5" fill="#1a1d24" />
                    <circle cx="70" cy="49" r="5" fill="#1a1d24" />
                    <circle cx="52" cy="47" r="1.5" fill="white" />
                    <circle cx="72" cy="47" r="1.5" fill="white" />
                    <ellipse cx="60" cy="61" rx="10" ry="7" fill="#fcd9a8" />
                    <ellipse cx="60" cy="58" rx="4" ry="3" fill="#2a1a0a" />
                    <rect x="42" y="73" width="36" height="6" rx="3" fill="#1f3a8a" />
                    <circle cx="60" cy="76" r="2.5" fill="#fcd34d" />
                  </svg>
                </div>
                <XpMiniBar
                  xp={chibiData.xp}
                  level={chibiData.level}
                  xpForCurrentLevel={chibiData.xpForCurrentLevel}
                  xpForNextLevel={chibiData.xpForNextLevel}
                />
              </Link>
            )}
          </div>
        </div>

        {/* Bottom thin editorial rule */}
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 h-px"
          aria-hidden="true"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 30%, rgba(245,179,0,0.12) 65%, transparent 100%)'
              : 'linear-gradient(90deg, transparent 0%, rgba(31,58,138,0.15) 30%, rgba(245,179,0,0.20) 65%, transparent 100%)',
          }}
        />
      </div>

      {/* ── MODULE BENTO GRID ────────────────────────────────────────── */}
      <div>
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          Quick Access
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
          {MODULES.map((mod) => (
            <ModuleCard key={mod.id} {...mod} />
          ))}
        </div>
        {/* ── NU Tools row: NUIS Portal + Outlook + Teams ── */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Ms365Card key={NUIS_LINK.id} {...NUIS_LINK} />
          {MS365_LINKS.map((link) => (
            <Ms365Card key={link.id} {...link} />
          ))}
        </div>
      </div>

      {/* ── LIVE CONTENT ─────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Upcoming Events */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-0.5 rounded-full bg-violet-500" aria-hidden="true" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                Upcoming Events
              </p>
            </div>
            <Link
              to={paths.events}
              className="text-xs font-bold text-primary transition-colors hover:text-primary-hover"
            >
              View all →
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-10 text-center',
                isDark ? 'border-white/10 bg-white/[0.02]' : 'border-border bg-surface-muted/40',
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950/40">
                <svg width="18" height="18" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-violet-600 dark:text-violet-400">
                  <rect x="3" y="5" width="22" height="20" rx="3" />
                  <path d="M18 3v4M10 3v4M3 11h22" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">No upcoming events</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Check back soon for campus happenings.</p>
              </div>
              {(user?.role === 'ROLE_FACULTY' || user?.role === 'ROLE_ADMIN') && (
                <Link
                  to={paths.eventsNew}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Create an event →
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingEvents.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          )}
        </section>

        {/* Recent Listings */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-0.5 rounded-full bg-emerald-500" aria-hidden="true" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                Campus Store
              </p>
            </div>
            <Link
              to={paths.marketplace}
              className="text-xs font-bold text-primary transition-colors hover:text-primary-hover"
            >
              Browse all →
            </Link>
          </div>

          {recentListings.length === 0 ? (
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-10 text-center',
                isDark ? 'border-white/10 bg-white/[0.02]' : 'border-border bg-surface-muted/40',
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                <svg width="18" height="18" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-emerald-600 dark:text-emerald-400">
                  <rect x="2" y="6" width="24" height="18" rx="3" />
                  <path d="M8 6V5a6 6 0 0 1 12 0v1" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">No listings yet</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Be the first to post something.</p>
              </div>
              <Link to={paths.marketplaceNew} className="text-xs font-bold text-primary hover:underline">
                Post a listing →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentListings.map((l) => (
                <ListingRow key={l.id} listing={l} />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── EDITORIAL FOOTER STRIP ──────────────────────────────────── */}
      <div
        className={cn(
          'flex items-center justify-between rounded-xl border px-5 py-3.5',
          isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface-muted/50',
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-7 w-7 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 50%, #7c3aed 100%)',
            }}
          />
          <div>
            <p className="text-[11px] font-bold text-foreground">NUverse Laguna</p>
            <p className="text-[10px] text-muted-foreground">NU Laguna Campus Ecosystem</p>
          </div>
        </div>
        <Link
          to={paths.settings}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          aria-label="Settings"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="2.5" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
          </svg>
        </Link>
      </div>

    </div>
  )
}
