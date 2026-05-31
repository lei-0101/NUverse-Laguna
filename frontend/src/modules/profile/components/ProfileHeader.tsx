import type { ReactNode } from 'react'
import { Avatar } from '@/shared/components/ui'
import { useThemeStore } from '@/shared/store/themeStore'

const SCHOOL_LABELS: Record<string, string> = {
  SCS:  'School of Computer Studies',
  SAS:  'School of Arts and Sciences',
  SEA:  'School of Engineering and Architecture',
  SHS:  'Senior High School',
  SABM: 'School of Accountancy, Business and Management',
}

const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN:   'Platform Administrator · NU Laguna',
  ROLE_FACULTY: 'Faculty Member · NU Laguna',
}

interface ProfileHeaderProps {
  name: string
  email?: string | null
  avatarUrl: string | null
  course: string | null
  bio: string | null
  interests: string | null
  enrollmentYear?: number | null
  followerCount: number
  followingCount: number
  detailsHidden?: boolean
  onShowFollowers?: () => void
  onShowFollowing?: () => void
  actions?: ReactNode
  role?: string | null
}

function StatButton({
  count, label, onClick,
}: { count: number; label: string; onClick?: () => void }) {
  const inner = (
    <div className="text-center">
      <p className="font-mono text-xl font-black tabular-nums text-foreground leading-none">
        {count.toLocaleString()}
      </p>
      <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
    </div>
  )

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="transition-opacity hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg p-1"
    >
      {inner}
    </button>
  ) : (
    <div className="p-1">{inner}</div>
  )
}

export function ProfileHeader({
  name,
  email,
  avatarUrl,
  course,
  bio,
  interests,
  enrollmentYear,
  followerCount,
  followingCount,
  detailsHidden = false,
  onShowFollowers,
  onShowFollowing,
  actions,
  role,
}: ProfileHeaderProps) {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const isAdminOrFaculty = role === 'ROLE_ADMIN' || role === 'ROLE_FACULTY'
  const schoolLabel = !isAdminOrFaculty && course
    ? (SCHOOL_LABELS[course.toUpperCase()] ? `${course.toUpperCase()} · ${SCHOOL_LABELS[course.toUpperCase()]}` : course)
    : null
  const enrollmentLabel = !isAdminOrFaculty && enrollmentYear ? `Enrolled ${enrollmentYear}` : null
  const roleLabel = isAdminOrFaculty ? (ROLE_LABELS[role!] ?? role) : null
  const subtitle = roleLabel ?? [schoolLabel, enrollmentLabel].filter(Boolean).join(' · ')

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface">
      {/* ── COVER BAND ─────────────────────────────────────────────── */}
      <div
        className="relative h-36 sm:h-48"
        style={{
          background: 'linear-gradient(135deg, #1f3a8a 0%, #2d52c4 30%, #4a2fa0 60%, #7c3aed 80%, rgba(245,179,0,0.7) 100%)',
        }}
      >
        {/* Layered mesh orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute -left-8 -top-8 h-40 w-40 rounded-full blur-3xl"
            style={{ background: 'rgba(74,110,232,0.4)' }}
          />
          <div
            className="absolute -right-8 -bottom-4 h-36 w-36 rounded-full blur-3xl"
            style={{ background: 'rgba(245,179,0,0.25)' }}
          />
          <div
            className="absolute left-1/3 top-1/2 -translate-y-1/2 h-28 w-28 rounded-full blur-2xl"
            style={{ background: 'rgba(167,139,250,0.3)' }}
          />
        </div>

        {/* Dot grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Decorative large watermark */}
        <div
          className="pointer-events-none absolute right-6 bottom-2 select-none text-[120px] font-black leading-none opacity-[0.06] text-white"
          aria-hidden="true"
        >
          NU
        </div>

        {/* Actions in top-right */}
        {actions && (
          <div className="absolute right-4 top-4 flex shrink-0 gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* ── PROFILE BODY ────────────────────────────────────────────── */}
      <div className="px-5 pb-6 sm:px-7">
        {/* Avatar overlapping cover */}
        <div className="flex items-end justify-between -mt-12 sm:-mt-14 mb-4">
          <div className="relative">
            {/* Glow ring behind avatar */}
            <div
              className="absolute -inset-1 rounded-full opacity-60 blur-md"
              style={{ background: 'linear-gradient(135deg, #1f3a8a, #7c3aed, #f5b300)' }}
              aria-hidden="true"
            />
            <div
              className="relative rounded-full p-[3px]"
              style={{ background: 'linear-gradient(135deg, #1f3a8a, #7c3aed, #f5b300)' }}
            >
              <div
                className="rounded-full p-[3px]"
                style={{ background: 'var(--color-surface)' }}
              >
                <Avatar src={avatarUrl} name={name} size="xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Name + subtitle + actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              {name}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-sm font-medium text-muted-foreground">{subtitle}</p>
            )}
            {email && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 8l10 7 10-7" />
                </svg>
                {email}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 gap-2 sm:hidden">
              {actions}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div
          className="mt-5 flex gap-8 border-t pt-5"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' }}
        >
          <StatButton count={followerCount}  label="Followers"  onClick={onShowFollowers} />
          <StatButton count={followingCount} label="Following"  onClick={onShowFollowing} />
        </div>

        {/* Bio / interests */}
        {detailsHidden ? (
          <p className="mt-4 text-sm text-muted-foreground">
            This profile is private. Follow to see more.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {bio && (
              <p className="max-w-prose text-sm leading-relaxed text-foreground">{bio}</p>
            )}
            {interests && (
              <p className="text-sm">
                <span className="font-semibold text-foreground">Interests — </span>
                <span className="text-muted-foreground">{interests}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
