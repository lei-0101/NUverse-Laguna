import type { ReactNode } from 'react'
import { Avatar } from '@/shared/components/ui'
import { formatYearLevel } from '../schemas'
import type { YearLevel } from '../types'

interface ProfileHeaderProps {
  name: string
  avatarUrl: string | null
  course: string | null
  yearLevel: YearLevel | null
  bio: string | null
  interests: string | null
  followerCount: number
  followingCount: number
  /** True when this is a private profile whose details the viewer may not see. */
  detailsHidden?: boolean
  onShowFollowers?: () => void
  onShowFollowing?: () => void
  actions?: ReactNode
}

function Stat({
  count,
  label,
  onClick,
}: {
  count: number
  label: string
  onClick?: () => void
}) {
  const inner = (
    <>
      <span className="font-mono tabular-nums font-bold text-foreground">{count.toLocaleString()}</span>{' '}
      <span className="text-muted-foreground text-xs uppercase tracking-wide">{label}</span>
    </>
  )
  return onClick ? (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-0 text-center hover:opacity-80 transition-opacity">
      {inner}
    </button>
  ) : (
    <span className="flex flex-col items-center gap-0 text-center">{inner}</span>
  )
}

/** Presentational profile summary card used by both own and public profiles. */
export function ProfileHeader({
  name,
  avatarUrl,
  course,
  yearLevel,
  bio,
  interests,
  followerCount,
  followingCount,
  detailsHidden = false,
  onShowFollowers,
  onShowFollowing,
  actions,
}: ProfileHeaderProps) {
  const yearLabel = formatYearLevel(yearLevel)
  const subtitle = [course, yearLabel].filter(Boolean).join(' · ')

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-surface shadow-sm">
      {/* Cover band */}
      <div
        className="relative h-28 sm:h-36"
        style={{
          background: 'linear-gradient(135deg, #1f3a8a 0%, #3b5bd9 40%, #7c3aed 70%, #f5b300 100%)',
        }}
      >
        {/* Decorative orbs in the cover */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute left-1/4 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full blur-2xl"
            style={{ background: 'rgba(245,179,0,0.25)' }} />
          <div className="absolute right-1/4 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full blur-2xl"
            style={{ background: 'rgba(167,139,250,0.25)' }} />
        </div>
        {/* Actions anchored to top-right of cover */}
        {actions && (
          <div className="absolute right-4 top-4 flex shrink-0 gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Body — avatar overlaps the cover */}
      <div className="px-5 pb-6 sm:px-6">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-4">
          <div
            className="rounded-full p-1 shadow-lg"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="ring-4 rounded-full"
              style={{ '--tw-ring-color': 'var(--color-surface)' } as React.CSSProperties}>
              <Avatar src={avatarUrl} name={name} size="xl" />
            </div>
          </div>
        </div>

        {/* Name + subtitle */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{name}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex gap-6 border-t border-border pt-4">
          <Stat count={followerCount} label="Followers" onClick={onShowFollowers} />
          <Stat count={followingCount} label="Following" onClick={onShowFollowing} />
        </div>

        {/* Bio / privacy */}
        {detailsHidden ? (
          <p className="mt-3 text-sm text-muted-foreground">
            This profile is private. Follow to see more.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-1.5">
            {bio && <p className="max-w-prose text-sm leading-relaxed text-foreground">{bio}</p>}
            {interests && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Interests:</span> {interests}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
