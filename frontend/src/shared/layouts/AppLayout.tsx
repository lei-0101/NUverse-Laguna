import { useCallback, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { useLogout } from '@/modules/auth/hooks/useAuth'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { Button } from '@/shared/components/ui'
import { NUverseMark } from '@/shared/components/NUverseMark'
import { cn } from '@/shared/lib/cn'
import { paths } from '@/shared/routes/paths'
import { NotificationBell } from '@/modules/notifications/components/NotificationBell'
import { AnnouncementBanner } from '@/modules/announcements/components/AnnouncementBanner'
import { BulldogCompanion } from '@/shared/components/BulldogCompanion'
import { useIdleTimer } from '@/shared/hooks/useIdleTimer'
import { toast } from '@/shared/store/toastStore'
import { useThemeStore } from '@/shared/store/themeStore'

const NAV_LINKS = [
  { to: paths.dashboard,   label: 'Home',        end: true  },
  { to: paths.marketplace, label: 'Marketplace'             },
  { to: paths.exchange,    label: 'Exchange'                },
  { to: paths.events,      label: 'Events'                  },
  { to: paths.lostFound,   label: 'Lost & Found'            },
  { to: paths.chibi,       label: '🐾 Chibi'               },
  { to: paths.profile,     label: 'Profile'                 },
] as const

function NavItem({ to, label, end, onClick }: { to: string; label: string; end?: boolean; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
        )
      }
    >
      {label}
    </NavLink>
  )
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <span
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white select-none"
      style={{ background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 60%, #7c3aed 100%)' }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

/** Application shell for authenticated routes: top nav + content outlet. */
export function AppLayout() {
  const user       = useAuthStore((state) => state.user)
  const logout     = useLogout()
  const navigate   = useNavigate()
  const isDark     = useThemeStore((s) => s.theme === 'dark')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    setMobileOpen(false)
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

  return (
    <div className="flex min-h-svh flex-col bg-bg">
      {/* Star field — visible only in dark mode via CSS */}
      <div className="stars-wrap" aria-hidden="true">
        <div className="stars-1" /><div className="stars-2" /><div className="stars-3" />
      </div>

      {/* Announcement banner — sits above everything */}
      <AnnouncementBanner />

      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{
          background: isDark ? 'rgba(10,13,20,0.88)' : 'rgba(255,255,255,0.92)',
          borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
          boxShadow: isDark
            ? '0 1px 0 rgba(255,255,255,0.04)'
            : '0 1px 0 rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        {/* Gradient accent strip at very bottom of header */}
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(74,110,232,0.5) 30%, rgba(245,179,0,0.4) 60%, transparent 100%)' }}
          aria-hidden="true"
        />

        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
          {/* Logo */}
          <Link to={paths.dashboard} className="flex items-center">
            <NUverseMark />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 sm:flex">
            {NAV_LINKS.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} end={'end' in item ? item.end : undefined} />
            ))}
            {user?.role === 'ROLE_ADMIN' && (
              <NavItem to={paths.admin} label="⚙️ Admin" />
            )}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <NotificationBell />
            <ThemeToggle />

            {/* User avatar + name */}
            {user && (
              <Link
                to={paths.profile}
                className="hidden items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-surface-muted sm:flex"
              >
                <UserAvatar name={user.fullName} />
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {user.fullName.split(' ')[0]}
                </span>
              </Link>
            )}

            <Link
              to={paths.settings}
              className="hidden rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground sm:flex"
              aria-label="Settings"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="2.5" />
                <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
              </svg>
            </Link>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              isLoading={logout.isPending}
              className="hidden sm:inline-flex"
            >
              Log out
            </Button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground sm:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="2" y1="2" x2="16" y2="16" />
                  <line x1="16" y1="2" x2="2" y2="16" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="2" y1="5" x2="16" y2="5" />
                  <line x1="2" y1="9" x2="16" y2="9" />
                  <line x1="2" y1="13" x2="16" y2="13" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            className="border-t px-4 pb-5 pt-3 sm:hidden"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
              background: isDark ? 'rgba(10,13,20,0.96)' : 'rgba(255,255,255,0.98)',
              animation: 'page-enter 0.18s ease-out',
            }}
          >
            {/* User row */}
            {user && (
              <div className="mb-3 flex items-center gap-2.5 rounded-xl p-3"
                style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
                <UserAvatar name={user.fullName} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.role.replace('ROLE_', '')}</p>
                </div>
              </div>
            )}
            <nav className="flex flex-col gap-0.5">
              {NAV_LINKS.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  end={'end' in item ? item.end : undefined}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
              {user?.role === 'ROLE_ADMIN' && (
                <NavItem to={paths.admin} label="⚙️ Admin" onClick={() => setMobileOpen(false)} />
              )}
            </nav>
            <div className="mt-4 flex items-center justify-between border-t pt-4"
              style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
              <Link to={paths.settings} onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                ⚙️ Settings
              </Link>
              <Button variant="secondary" size="sm" onClick={handleLogout} isLoading={logout.isPending}>
                Log out
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      {/* Persistent floating Bulldog companion */}
      <BulldogCompanion />
    </div>
  )
}
