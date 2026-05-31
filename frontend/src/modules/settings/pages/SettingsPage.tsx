import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { useThemeStore } from '@/shared/store/themeStore'
import { paths } from '@/shared/routes/paths'
import { cn } from '@/shared/lib/cn'
import { useTermsStore } from '@/shared/components/TermsModal'
import { ReportModal } from '@/shared/components/ReportModal'

type Section = 'account' | 'appearance' | 'privacy' | 'terms'

const SECTION_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  {
    id: 'account',
    label: 'Account',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    id: 'privacy',
    label: 'Notifications',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
  {
    id: 'terms' as Section,
    label: 'Terms & Rules',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        checked ? 'bg-primary' : 'bg-border',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}

function SettingRow({ label, description, control }: {
  label: string; description?: string; control: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {control}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3.5 first:pt-0 last:pb-0">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function AccountSection() {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const user   = useAuthStore((s) => s.user)
  const [showReport, setShowReport] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">Account</p>
        <h2 className="text-2xl font-black text-foreground">Your Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage your personal information and profile.</p>
      </div>

      <div
        className={cn(
          'overflow-hidden rounded-2xl border',
          isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface',
        )}
      >
        <div className="divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <div className="px-5 py-4">
            <InfoRow label="Full Name" value={user?.fullName ?? '—'} />
          </div>
          <div className="px-5 py-4">
            <InfoRow label="Email Address" value={user?.email ?? '—'} />
          </div>
          <div className="px-5 py-4">
            <InfoRow label="Role" value={user?.role.replace('ROLE_', '') ?? '—'} />
          </div>
          <div className="px-5 py-4 flex items-center gap-3">
            <Link
              to={paths.editProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-all hover:bg-primary-hover hover:-translate-y-0.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile
            </Link>
            <button
              onClick={() => setShowReport(true)}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all hover:-translate-y-0.5',
                isDark ? 'border-red-500/30 text-danger hover:bg-danger/5' : 'border-red-200 text-danger hover:bg-danger/5',
              )}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Report an Issue
            </button>
          </div>
        </div>
      </div>

      <ReportModal isOpen={showReport} onClose={() => setShowReport(false)} />
    </div>
  )
}

function AppearanceSection() {
  const { theme, setTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">Appearance</p>
        <h2 className="text-2xl font-black text-foreground">Look & Feel</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose how NUverse looks for you.</p>
      </div>

      <div
        className={cn(
          'overflow-hidden rounded-2xl border px-5',
          isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface',
        )}
      >
        <SettingRow
          label="Dark Mode"
          description="Campus Night theme for late-night browsing."
          control={<Toggle checked={isDark} onChange={(v) => setTheme(v ? 'dark' : 'light')} />}
        />
      </div>

      {/* Theme preview cards */}
      <div className="grid grid-cols-2 gap-3">
        {(['light', 'dark'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={cn(
              'relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all',
              theme === t
                ? 'border-primary shadow-[var(--shadow-md)]'
                : 'border-border hover:border-border/80',
            )}
            style={t === 'dark'
              ? { background: '#131720' }
              : { background: 'white' }
            }
          >
            {/* Active indicator */}
            {theme === t && (
              <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}

            {/* Mock UI chrome */}
            <div className="space-y-2">
              <div
                className="h-2 w-16 rounded-full"
                style={{ background: t === 'dark' ? '#e6e8ee' : '#1a1d24', opacity: 0.8 }}
              />
              <div
                className="h-1.5 w-24 rounded-full"
                style={{ background: t === 'dark' ? '#99a1b3' : '#5b6472', opacity: 0.5 }}
              />
              <div
                className="mt-3 h-8 w-full rounded-lg"
                style={{ background: t === 'dark' ? 'rgba(74,110,232,0.2)' : 'rgba(31,58,138,0.08)' }}
              />
            </div>

            <p
              className="mt-3 text-xs font-bold"
              style={{ color: t === 'dark' ? '#e6e8ee' : '#1a1d24' }}
            >
              {t === 'light' ? '☀️ Campus Day' : '🌙 Campus Night'}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

function NotificationsSection() {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const [allNotifs, setAllNotifs]      = useState(true)
  const [followerNotifs, setFollower]  = useState(true)
  const [eventNotifs, setEvents]       = useState(true)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">Notifications</p>
        <h2 className="text-2xl font-black text-foreground">Notification Preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">Control what alerts you receive in-app.</p>
      </div>

      <div
        className={cn(
          'overflow-hidden rounded-2xl border px-5',
          isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface',
        )}
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : undefined }}
      >
        <div
          className="divide-y"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
        >
          <SettingRow
            label="All Notifications"
            description="Master toggle for all in-app notifications."
            control={<Toggle checked={allNotifs} onChange={setAllNotifs} />}
          />
          <SettingRow
            label="New Follower"
            description="When someone starts following you."
            control={<Toggle checked={followerNotifs && allNotifs} onChange={setFollower} />}
          />
          <SettingRow
            label="Event Updates"
            description="RSVP confirmations and event reminders."
            control={<Toggle checked={eventNotifs && allNotifs} onChange={setEvents} />}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Profile privacy is managed on your{' '}
        <Link to={paths.profile} className="text-primary font-medium hover:underline">
          profile page
        </Link>
        .
      </p>
    </div>
  )
}

function TermsSection() {
  const isDark  = useThemeStore((s) => s.theme === 'dark')
  const openTerms = useTermsStore((s) => s.open)

  const TERMS_CONTENT = [
    { title: '1. Community Standards', body: 'All users must treat fellow Bulldogs with respect and dignity. Harassment, bullying, discrimination, or any form of abusive behavior is strictly prohibited and will result in immediate suspension or permanent ban.' },
    { title: '2. Marketplace Rules', body: 'Items listed in the Marketplace must be accurate in description and pricing. Fraudulent listings, scams, or sale of prohibited items are strictly banned. Sellers and buyers agree to transact in good faith.' },
    { title: '3. Bulldog Exchange Policy', body: 'Reservations must be honored within the pickup window (48 hours, excluding Sundays). Repeated no-shows may lead to restrictions. The ₱50 reservation fee is non-refundable unless the reservation expires without fault of the student.' },
    { title: '4. Content & Conduct', body: 'Any content posted must be relevant, honest, and lawful. Inappropriate content (NSFW, spam, offensive language, misinformation) will be removed and may result in account suspension.' },
    { title: '5. Privacy & Data', body: 'Your personal data is used solely for platform functionality within NU Laguna. Do not share sensitive personal information through the platform.' },
    { title: '6. Academic Integrity', body: 'The platform must not be used to facilitate academic dishonesty, including the sale or distribution of exam answers or plagiarized work.' },
    { title: '7. Enforcement & Suspension', body: 'Violations may result in warnings, temporary suspension, or permanent banning at the discretion of platform administrators.' },
    { title: '8. Ethics & Responsibility', body: 'You are personally responsible for all activity conducted under your account. Use this platform to uplift your campus community.' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">Legal</p>
        <h2 className="text-2xl font-black text-foreground">Terms, Conditions &amp; Rules</h2>
        <p className="mt-1 text-sm text-muted-foreground">NUverse Laguna platform guidelines and community standards.</p>
      </div>

      <button
        onClick={openTerms}
        className={cn(
          'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5',
          isDark ? 'border-primary/20' : 'border-primary/20',
        )}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
        View Full Terms (Interactive)
      </button>

      <div className="flex flex-col gap-3">
        {TERMS_CONTENT.map((item) => (
          <div
            key={item.title}
            className={cn(
              'rounded-xl border p-4',
              isDark ? 'border-white/6 bg-white/[0.02]' : 'border-border bg-surface',
            )}
          >
            <p className={cn('mb-1 text-xs font-black uppercase tracking-[0.2em]', isDark ? 'text-white' : 'text-foreground')}>
              {item.title}
            </p>
            <p className="text-sm text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SettingsPage() {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const [activeSection, setActiveSection] = useState<Section>('account')

  return (
    <div className="flex flex-col gap-6 animate-[page-enter_0.3s_ease-out]">

      {/* ── EDITORIAL HEADER ────────────────────────────────────────── */}
      <div
        className="relative -mx-4 -mt-8 overflow-hidden px-4 pt-8 pb-6 sm:-mx-6 sm:px-6"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 20% 60%, rgba(74,110,232,0.10) 0%, transparent 55%), #0a0d14'
            : 'radial-gradient(ellipse at 20% 60%, rgba(74,110,232,0.08) 0%, transparent 55%), #f7f8fa',
        }}
      >
        <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
          Preferences
        </p>
        <h1 className={cn(
          'text-4xl font-black leading-none tracking-tight sm:text-5xl',
          isDark ? 'text-white' : 'text-foreground',
        )}>
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your account, appearance, and notifications.
        </p>

        {/* Bottom rule */}
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 h-px"
          aria-hidden="true"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(74,110,232,0.3) 40%, transparent 100%)',
          }}
        />
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        {/* Sidebar */}
        <aside className="w-full shrink-0 sm:w-48">
          <nav className="flex flex-row gap-1 sm:flex-col">
            {SECTION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-left transition-all',
                  activeSection === item.id
                    ? isDark
                      ? 'bg-white/8 text-foreground'
                      : 'bg-foreground/5 text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSection === 'account'    && <AccountSection />}
          {activeSection === 'appearance' && <AppearanceSection />}
          {activeSection === 'privacy'    && <NotificationsSection />}
          {activeSection === 'terms'      && <TermsSection />}
        </div>
      </div>
    </div>
  )
}
