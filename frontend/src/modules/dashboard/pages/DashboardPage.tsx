import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/shared/store/authStore'
import { useThemeStore } from '@/shared/store/themeStore'
import { eventsApi } from '@/modules/events/services/eventsApi'
import { marketplaceApi } from '@/modules/marketplace/services/marketplaceApi'
import { paths, eventDetailPath, marketplaceListingPath } from '@/shared/routes/paths'
import { cn } from '@/shared/lib/cn'

// ── helpers ───────────────────────────────────────────────────────────────────

function timeOfDayGreeting(): { greeting: string; emoji: string; line: string } {
  const h = new Date().getHours()
  if (h < 5)  return { greeting: 'Good night',     emoji: '🌙', line: 'The campus is quiet. You shouldn\'t be up this late.' }
  if (h < 12) return { greeting: 'Good morning',   emoji: '☀️', line: 'A fresh start. Let\'s see what\'s on campus today.' }
  if (h < 17) return { greeting: 'Good afternoon', emoji: '🌤️', line: 'Afternoon energy — events, listings, and ideas await.' }
  if (h < 21) return { greeting: 'Good evening',   emoji: '🌆', line: 'Wind down with what\'s happening around campus.' }
  return       { greeting: 'Good night',     emoji: '🌙', line: 'Late night mode. Browse safely, Bulldog.' }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

function formatPrice(n: number) {
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`
}

const CATEGORY_META: Record<string, { color: string; icon: string }> = {
  ACADEMIC:  { color: 'from-blue-400 to-cyan-400',     icon: '🎓' },
  CULTURAL:  { color: 'from-pink-400 to-purple-400',   icon: '🎭' },
  SPORTS:    { color: 'from-green-400 to-emerald-400', icon: '🏆' },
  SEMINAR:   { color: 'from-indigo-400 to-blue-500',   icon: '📊' },
  SOCIAL:    { color: 'from-orange-400 to-pink-400',   icon: '🎉' },
  OTHER:     { color: 'from-gray-400 to-slate-400',    icon: '📌' },
}

// ── sub-components ────────────────────────────────────────────────────────────

function EventCardSmall({ event }: {
  event: { id: string; title: string; category: string; location: string; startTime: string; rsvpCount: number; capacity: number | null }
}) {
  const meta = CATEGORY_META[event.category] ?? CATEGORY_META.OTHER
  return (
    <Link
      to={eventDetailPath(event.id)}
      className="group flex gap-3.5 rounded-2xl border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-border/80"
    >
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white text-xl', meta.color)}>
        {meta.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {event.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {formatDate(event.startTime)} · {event.location}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="font-mono text-[11px] font-medium tabular-nums text-muted-foreground">
            {event.rsvpCount} going
          </span>
          {event.capacity && (
            <>
              <span className="text-border">·</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-14 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                    style={{ width: `${Math.min((event.rsvpCount / event.capacity) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                  {Math.round((event.rsvpCount / event.capacity) * 100)}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

function ListingCardSmall({ listing }: {
  listing: { id: string; title: string; price: number; condition: string; thumbnailUrl: string | null; seller: { fullName: string } }
}) {
  const conditionColor: Record<string, string> = {
    NEW:      'text-emerald-600 dark:text-emerald-400',
    LIKE_NEW: 'text-green-600 dark:text-green-400',
    GOOD:     'text-blue-600 dark:text-blue-400',
    FAIR:     'text-amber-600 dark:text-amber-400',
  }
  const conditionLabel: Record<string, string> = {
    NEW: 'New', LIKE_NEW: 'Like New', GOOD: 'Good', FAIR: 'Fair',
  }
  return (
    <Link
      to={marketplaceListingPath(listing.id)}
      className="group flex gap-3.5 rounded-2xl border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-border/80"
    >
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-surface-muted border border-border">
        {listing.thumbnailUrl ? (
          <img src={listing.thumbnailUrl} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl">🏷️</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {listing.title}
        </p>
        <p className="mt-0.5 font-mono tabular-nums text-sm font-bold text-accent">
          {formatPrice(listing.price)}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className={cn('text-xs font-medium', conditionColor[listing.condition] ?? 'text-muted-foreground')}>
            {conditionLabel[listing.condition] ?? listing.condition}
          </span>
          <span className="text-border text-xs">·</span>
          <span className="truncate text-xs text-muted-foreground">{listing.seller.fullName}</span>
        </div>
      </div>
    </Link>
  )
}

function QuickActionCard({ icon, label, desc, to, gradient, glowColor }: {
  icon: string; label: string; desc: string; to: string; gradient: string; glowColor: string
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-5 text-white transition-all duration-200 hover:-translate-y-1.5 hover:shadow-2xl active:scale-[0.97]',
        gradient,
      )}
      style={{ boxShadow: `0 4px 20px ${glowColor}` }}
    >
      {/* Subtle inner highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" aria-hidden="true" />
      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)' }} aria-hidden="true" />
      {/* Background circle decoration */}
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.15] transition-opacity group-hover:opacity-25"
        width="70" height="70" viewBox="0 0 70 70" fill="currentColor" aria-hidden="true">
        <circle cx="35" cy="35" r="33" />
      </svg>
      <div className="relative z-10">
        <div className="mb-2.5 text-3xl">{icon}</div>
        <p className="text-sm font-bold">{label}</p>
        <p className="mt-0.5 text-xs text-white/75">{desc}</p>
      </div>
    </Link>
  )
}

function SectionHeader({ title, href, label }: { title: string; href: string; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <Link to={href}
        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-primary transition-all hover:bg-primary/8 hover:text-primary-hover">
        {label} →
      </Link>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export function DashboardPage() {
  const user    = useAuthStore((state) => state.user)
  const isDark  = useThemeStore((s) => s.theme === 'dark')
  const { greeting, emoji, line } = timeOfDayGreeting()
  const firstName = user?.fullName.split(' ')[0] ?? 'there'

  const { data: eventsData } = useQuery({
    queryKey: ['events', 'upcoming', 'dashboard'],
    queryFn: () => eventsApi.getEvents({ status: 'PUBLISHED', upcomingOnly: true, size: 4 }),
    staleTime: 2 * 60 * 1000,
  })

  const { data: listingsData } = useQuery({
    queryKey: ['marketplace', 'recent', 'dashboard'],
    queryFn: () => marketplaceApi.getListings({}, 0, 4),
    staleTime: 2 * 60 * 1000,
  })

  const upcomingEvents  = eventsData?.content  ?? []
  const recentListings  = listingsData?.content ?? []

  return (
    <div className="flex flex-col gap-8 animate-[page-enter_0.3s_ease-out]">

      {/* ── Greeting banner ──────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl border p-7 sm:p-8"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(31,58,138,0.18) 0%, rgba(74,110,232,0.10) 45%, rgba(245,179,0,0.08) 100%)'
            : 'linear-gradient(135deg, rgba(219,234,254,0.8) 0%, rgba(238,242,255,0.9) 45%, rgba(254,249,231,0.7) 100%)',
          borderColor: isDark ? 'rgba(74,110,232,0.2)' : 'rgba(31,58,138,0.1)',
        }}
      >
        {/* Subtle mesh gradient */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(245,179,0,0.2) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(74,110,232,0.18) 0%, transparent 70%)' }} />
        </div>
        {/* Watermark */}
        <span className="pointer-events-none absolute right-4 top-4 select-none text-[7rem] font-black leading-none opacity-[0.035]"
          style={{ color: 'var(--color-primary)' }} aria-hidden="true">NU</span>

        <div className="relative z-10">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {emoji} {greeting}, {firstName}!
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{line}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
              style={{
                background: isDark ? 'rgba(74,110,232,0.15)' : 'rgba(31,58,138,0.08)',
                color: isDark ? '#818cf8' : '#1f3a8a',
              }}
            >
              {user?.role.replace('ROLE_', '')}
            </span>
            <span className="text-xs text-muted-foreground">· NUverse Laguna</span>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <QuickActionCard icon="🛒" label="Marketplace" desc="Buy & sell" to={paths.marketplace}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600" glowColor="rgba(16,185,129,0.25)" />
        <QuickActionCard icon="🏪" label="Exchange" desc="Official merch" to={paths.exchange}
          gradient="bg-gradient-to-br from-amber-500 to-orange-500" glowColor="rgba(245,158,11,0.25)" />
        <QuickActionCard icon="🎉" label="Events" desc="RSVP & attend" to={paths.events}
          gradient="bg-gradient-to-br from-purple-500 to-pink-600" glowColor="rgba(168,85,247,0.25)" />
        <QuickActionCard icon="🔍" label="Lost & Found" desc="Help campus" to={paths.lostFound}
          gradient="bg-gradient-to-br from-orange-400 to-amber-500" glowColor="rgba(251,146,60,0.25)" />
        <QuickActionCard icon="🏋️" label="Sports" desc="Inspire Academy" to={paths.inspire}
          gradient="bg-gradient-to-br from-red-500 to-rose-600" glowColor="rgba(239,68,68,0.25)" />
        <QuickActionCard icon="🎓" label="NUIS" desc="Academic portal" to={paths.nuis}
          gradient="bg-gradient-to-br from-slate-600 to-slate-700" glowColor="rgba(71,85,105,0.25)" />
      </div>

      {/* ── Two-column grid ──────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Upcoming Events */}
        <div className="flex flex-col gap-3">
          <SectionHeader title="Upcoming Events" href={paths.events} label="View all" />
          {upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center gap-2">
              <span className="text-4xl opacity-40">🎉</span>
              <p className="text-sm text-muted-foreground">No upcoming events. Check back soon!</p>
              {(user?.role === 'ROLE_FACULTY' || user?.role === 'ROLE_ADMIN') && (
                <Link to={paths.eventsNew} className="mt-1 text-sm font-medium text-primary hover:underline">
                  Create an event →
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingEvents.map((e) => (
                <EventCardSmall key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Listings */}
        <div className="flex flex-col gap-3">
          <SectionHeader title="Recent Listings" href={paths.marketplace} label="Browse all" />
          {recentListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center gap-2">
              <span className="text-4xl opacity-40">🛒</span>
              <p className="text-sm text-muted-foreground">No listings yet. Be the first to post!</p>
              <Link to={paths.marketplaceNew} className="mt-1 text-sm font-medium text-primary hover:underline">
                Post a listing →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentListings.map((l) => (
                <ListingCardSmall key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
