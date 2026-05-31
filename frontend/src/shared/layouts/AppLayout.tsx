import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { useLogout } from '@/modules/auth/hooks/useAuth'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { NUverseMark } from '@/shared/components/NUverseMark'
import { cn } from '@/shared/lib/cn'
import { paths } from '@/shared/routes/paths'
import { NotificationBell } from '@/modules/notifications/components/NotificationBell'
import { AnnouncementBanner } from '@/modules/announcements/components/AnnouncementBanner'
import { BulldogCompanion } from '@/shared/components/BulldogCompanion'
import { useIdleTimer } from '@/shared/hooks/useIdleTimer'
import { toast } from '@/shared/store/toastStore'
import { useThemeStore } from '@/shared/store/themeStore'
import { useQuery } from '@tanstack/react-query'
import { messagesApi } from '@/modules/messages/services/messagesApi'

function MessageBell() {
  const { data: count = 0 } = useQuery({
    queryKey: ['messages', 'unread-count'],
    queryFn: messagesApi.getUnreadCount,
    refetchInterval: 30_000,
  })
  return (
    <Link
      to={paths.messages}
      className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
      aria-label={`Messages${count > 0 ? ` — ${count} unread` : ''}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-black text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}

const NAV_LINKS = [
  { to: paths.dashboard,     label: 'Home',          end: true  },
  { to: paths.marketplace,   label: 'Marketplace'               },
  { to: paths.exchange,      label: 'Exchange'                  },
  { to: paths.events,        label: 'Events'                    },
  { to: paths.lostFound,     label: 'Lost & Found'              },
  { to: paths.announcements, label: 'Announcements'             },
  { to: paths.chibi,         label: 'Chibi'                     },
] as const

function NavItem({
  to,
  label,
  end,
  onClick,
}: {
  to: string
  label: string
  end?: boolean
  onClick?: () => void
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'nav-item relative whitespace-nowrap px-2.5 py-1 text-sm transition-colors duration-150 rounded-lg',
          isActive
            ? 'nav-item-active'
            : 'text-muted-foreground hover:text-foreground hover:bg-surface-muted/60',
        )
      }
    >
      {label}
    </NavLink>
  )
}

function UserAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  const dim = size === 'md' ? 'h-9 w-9 text-xs' : 'h-7 w-7 text-[11px]'
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white select-none',
        dim,
      )}
      style={{ background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 60%, #7c3aed 100%)' }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

export function AppLayout() {
  const user       = useAuthStore((state) => state.user)
  const logout     = useLogout()
  const navigate   = useNavigate()
  const isDark     = useThemeStore((s) => s.theme === 'dark')
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    setMobileOpen(false)
    setConfirmLogout(true)
  }

  const confirmAndLogout = () => {
    setConfirmLogout(false)
    logout.mutate(undefined, {
      onSettled: () => navigate(paths.login, { replace: true }),
    })
  }

  const handleIdle = useCallback(() => {
    logout.mutate(undefined, {
      onSettled: () => {
        navigate(paths.login, { replace: true })
        toast.warning('You were logged out due to 10 minutes of inactivity.')
      },
    })
  }, [logout, navigate])

  const handleIdleWarn = useCallback(() => {
    toast.warning('You will be logged out in 1 minute due to inactivity.')
  }, [])

  useIdleTimer({ onIdle: handleIdle, onWarn: handleIdleWarn })

  /* Close drawer on outside click */
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen])

  /* Body scroll lock when drawer open */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <div className="flex min-h-svh flex-col bg-bg">
      {/* Star field — CSS-only, dark mode only */}
      <div className="stars-wrap" aria-hidden="true">
        <div className="stars-1" /><div className="stars-2" /><div className="stars-3" />
      </div>

      {/* Subtle atmospheric background glow — works both modes */}
      {!isDark && (
        <div
          className="pointer-events-none fixed inset-0 z-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse at 10% 0%, rgba(74,110,232,0.04) 0%, transparent 45%),' +
              'radial-gradient(ellipse at 90% 100%, rgba(245,179,0,0.03) 0%, transparent 45%)',
          }}
        />
      )}

      {/* Announcement banner */}
      <AnnouncementBanner />

      {/* ── Top navigation bar ───────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: isDark ? 'rgba(10,13,20,0.90)' : 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
          boxShadow: isDark
            ? '0 1px 0 rgba(255,255,255,0.04)'
            : '0 1px 0 rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)',
        }}
      >
        {/* Gradient accent strip on header bottom */}
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 h-[2px]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(74,110,232,0.45) 30%, rgba(245,179,0,0.35) 65%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link to={paths.dashboard} className="flex shrink-0 items-center">
            <NUverseMark />
          </Link>

          {/* Desktop nav — centered */}
          <nav className="hidden shrink-0 items-center gap-1 sm:flex lg:gap-2 xl:gap-4" aria-label="Main navigation">
            {NAV_LINKS.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                end={'end' in item ? item.end : undefined}
              />
            ))}
            {user?.role === 'ROLE_ADMIN' && (
              <NavItem to={paths.admin} label="Admin" />
            )}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <MessageBell />
            <NotificationBell />

            {/* User avatar dropdown (desktop) */}
            {user && (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to={paths.profile}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-muted"
                >
                  <UserAvatar name={user.fullName} />
                  <span className="max-w-[96px] truncate text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                    {user.fullName.split(' ')[0]}
                  </span>
                </Link>
                <Link
                  to={paths.settings}
                  className="flex h-8 items-center justify-center rounded-lg px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="h-8 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-border/60 hover:bg-surface-muted hover:text-foreground disabled:opacity-50"
                >
                  {logout.isPending ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground sm:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-drawer"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? (
                  <>
                    <line x1="2" y1="2" x2="16" y2="16" />
                    <line x1="16" y1="2" x2="2" y2="16" />
                  </>
                ) : (
                  <>
                    <line x1="2" y1="5"  x2="16" y2="5" />
                    <line x1="2" y1="9"  x2="16" y2="9" />
                    <line x1="2" y1="13" x2="16" y2="13" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer overlay ─────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm sm:hidden"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer panel ───────────────────────────── */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        className={cn(
          'fixed inset-y-0 right-0 z-40 w-72 flex-col border-l border-border shadow-[var(--shadow-xl)] sm:hidden',
          mobileOpen ? 'flex' : 'hidden',
        )}
        style={{
          background: isDark ? 'rgba(13,17,28,0.98)' : 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(24px)',
          animation: mobileOpen ? 'slide-right 0.28s cubic-bezier(0,0,0.2,1) both' : undefined,
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <NUverseMark size={32} />
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            aria-label="Close menu"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        {/* User card */}
        {user && (
          <div className="border-b border-border px-5 py-4">
            <Link
              to={paths.profile}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-muted"
            >
              <UserAvatar name={user.fullName} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{user.fullName}</p>
                <p className="text-xs text-muted-foreground">{user.role.replace('ROLE_', '')}</p>
              </div>
            </Link>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4" aria-label="Mobile navigation">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : undefined}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          {user?.role === 'ROLE_ADMIN' && (
            <NavLink
              to={paths.admin}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                )
              }
            >
              Admin
            </NavLink>
          )}
        </nav>

        {/* Drawer footer */}
        <div className="border-t border-border px-5 py-4 space-y-2">
          <Link
            to={paths.settings}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="2.5" />
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
            </svg>
            Settings
          </Link>
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="w-full rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-danger/30 hover:bg-danger/5 hover:text-danger disabled:opacity-50"
          >
            {logout.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>

      {/* ── Page content ─────────────────────────────────── */}
      <main className="relative z-10 mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <BulldogCompanion />

      {/* ── Sign-out confirmation modal ───────────────────── */}
      {confirmLogout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setConfirmLogout(false)}
        >
          <div
            className={cn(
              'mx-4 w-full max-w-sm rounded-2xl border p-6 shadow-2xl',
              isDark ? 'border-white/10 bg-[#131720]' : 'border-border bg-white',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h2 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-foreground')}>
              Sign out?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You'll need to log in again to access NUverse Laguna.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmLogout(false)}
                className={cn(
                  'flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-colors',
                  isDark ? 'border-white/10 text-foreground hover:bg-white/5' : 'border-border text-foreground hover:bg-surface-muted',
                )}
              >
                Cancel
              </button>
              <button
                onClick={confirmAndLogout}
                disabled={logout.isPending}
                className="flex-1 rounded-xl bg-danger py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {logout.isPending ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
