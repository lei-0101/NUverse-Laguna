import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { announcementsApi } from '../services/announcementsApi'
import type { Announcement } from '../types'
import { cn } from '@/shared/lib/cn'

const PRIORITY_STYLES = {
  CRITICAL:  'bg-red-600 text-white',
  IMPORTANT: 'bg-amber-500 text-white',
  GENERAL:   'bg-primary text-white',
} as const

const PRIORITY_LABEL = {
  CRITICAL:  '🚨 CRITICAL',
  IMPORTANT: '⚠️ IMPORTANT',
  GENERAL:   '📢 NOTICE',
} as const

function SingleBanner({ announcement, onDismiss }: { announcement: Announcement; onDismiss: () => void }) {
  const style = PRIORITY_STYLES[announcement.priority]
  const label = PRIORITY_LABEL[announcement.priority]

  return (
    <div
      className={cn(
        'relative flex items-start justify-between gap-4 px-4 py-3 text-sm',
        style,
        announcement.priority === 'CRITICAL' && 'animate-pulse-once',
      )}
      role="alert"
      aria-live={announcement.priority === 'CRITICAL' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0 font-bold text-xs tracking-widest uppercase opacity-90">
          {label}
        </span>
        <div>
          <span className="font-semibold">{announcement.title}</span>
          {' '}
          <span className="opacity-90">{announcement.body}</span>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded opacity-70 transition-opacity hover:opacity-100 mt-0.5"
        aria-label="Dismiss announcement"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M2 2l10 10M12 2L2 12" />
        </svg>
      </button>
    </div>
  )
}

/**
 * Fetches active announcements and renders them as top-of-page banners.
 * CRITICAL announcements pulse and cannot be permanently dismissed (re-appear on refresh).
 */
export function AnnouncementBanner() {
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', 'active'],
    queryFn: announcementsApi.getActive,
    staleTime: 60_000,
    refetchInterval: 2 * 60_000,
  })

  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const visible = announcements.filter(
    (a) => !dismissed.has(a.id) || a.priority === 'CRITICAL',
  )

  if (visible.length === 0) return null

  // Show highest-priority banner only (CRITICAL > IMPORTANT > GENERAL)
  const sorted = [...visible].sort((a, b) => {
    const rank = { CRITICAL: 3, IMPORTANT: 2, GENERAL: 1 }
    return rank[b.priority] - rank[a.priority]
  })

  return (
    <div className="z-50">
      {sorted.slice(0, 1).map((a) => (
        <SingleBanner
          key={a.id}
          announcement={a}
          onDismiss={() => setDismissed((s) => new Set([...s, a.id]))}
        />
      ))}
    </div>
  )
}
