import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { useThemeStore } from '@/shared/store/themeStore'
import { paths } from '@/shared/routes/paths'
import { cn } from '@/shared/lib/cn'

type Section = 'account' | 'appearance' | 'privacy'

function SectionNav({ active, onChange }: { active: Section; onChange: (s: Section) => void }) {
  const items: { id: Section; label: string; icon: string }[] = [
    { id: 'account',    label: 'Account',    icon: '👤' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'privacy',    label: 'Privacy',    icon: '🔒' },
  ]

  return (
    <nav className="flex flex-row gap-1 sm:flex-col">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors',
            active === item.id
              ? 'bg-surface-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <span>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
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
  label: string
  description?: string
  control: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {control}
    </div>
  )
}

function AccountSection() {
  const user = useAuthStore((s) => s.user)

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-foreground">Account</h2>
      <div className="rounded-2xl border border-border bg-surface divide-y divide-border">
        <div className="p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Full Name</p>
          <p className="text-sm text-foreground">{user?.fullName}</p>
        </div>
        <div className="p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Email</p>
          <p className="text-sm text-foreground">{user?.email}</p>
        </div>
        <div className="p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Role</p>
          <p className="text-sm text-foreground">{user?.role.replace('ROLE_', '')}</p>
        </div>
        <div className="p-4">
          <Link
            to={paths.editProfile}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  )
}

function AppearanceSection() {
  const { theme, setTheme } = useThemeStore()

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-foreground">Appearance</h2>
      <div className="rounded-2xl border border-border bg-surface px-4 divide-y divide-border">
        <SettingRow
          label="Dark Mode"
          description="Switch between campus day (light) and campus night (dark)."
          control={<Toggle checked={theme === 'dark'} onChange={(v) => setTheme(v ? 'dark' : 'light')} />}
        />
      </div>

      {/* Live preview card */}
      <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Live Preview</p>
        <div className={cn(
          'rounded-xl border p-4 transition-all',
          theme === 'dark'
            ? 'border-border bg-[#131720] text-[#e6e8ee]'
            : 'border-[#e2e5ec] bg-white text-[#1a1d24]'
        )}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">N</div>
            <div>
              <p className="text-sm font-semibold">NUverse Laguna</p>
              <p className={cn('text-xs', theme === 'dark' ? 'text-[#99a1b3]' : 'text-[#5b6472]')}>
                {theme === 'dark' ? '🌙 Campus Night' : '☀️ Campus Day'}
              </p>
            </div>
          </div>
          <p className={cn('text-xs leading-relaxed', theme === 'dark' ? 'text-[#99a1b3]' : 'text-[#5b6472]')}>
            {theme === 'dark'
              ? 'Stars are out. The campus is quiet. A great time to study or browse the marketplace.'
              : 'Good morning! The campus is alive with energy. Check out today\'s upcoming events.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function PrivacySection() {
  const [notifications, setNotifications] = useState(true)
  const [followerNotifs, setFollowerNotifs] = useState(true)
  const [eventNotifs, setEventNotifs] = useState(true)

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-foreground">Privacy & Notifications</h2>

      <div className="rounded-2xl border border-border bg-surface px-4 divide-y divide-border">
        <SettingRow
          label="All Notifications"
          description="Master toggle for all in-app notifications."
          control={<Toggle checked={notifications} onChange={setNotifications} />}
        />
        <SettingRow
          label="New Follower"
          description="When someone starts following you."
          control={<Toggle checked={followerNotifs && notifications} onChange={setFollowerNotifs} />}
        />
        <SettingRow
          label="Event Updates"
          description="RSVP confirmations and event reminders."
          control={<Toggle checked={eventNotifs && notifications} onChange={setEventNotifs} />}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Profile privacy settings (visibility, marketplace activity, chibi showcase) are managed on your{' '}
          <Link to={paths.editProfile} className="text-primary hover:underline">
            profile settings page
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('account')

  return (
    <div className="flex flex-col gap-6 animate-[page-enter_0.3s_ease-out]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account, appearance, and privacy.</p>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        {/* Sidebar nav */}
        <aside className="w-full shrink-0 sm:w-44">
          <SectionNav active={activeSection} onChange={setActiveSection} />
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSection === 'account'    && <AccountSection />}
          {activeSection === 'appearance' && <AppearanceSection />}
          {activeSection === 'privacy'    && <PrivacySection />}
        </div>
      </div>
    </div>
  )
}
