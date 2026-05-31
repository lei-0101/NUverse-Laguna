import { useEffect, useState } from 'react'

interface ReservationCountdownProps {
  expiresAt: string
}

/** Returns ms remaining until expiry, pausing Sundays (they don't count toward pickup deadline). */
function computeMs(expiresAt: string): number {
  const now = new Date()
  const expires = new Date(expiresAt)
  const raw = expires.getTime() - now.getTime()
  if (raw <= 0) return 0

  const isSunday = now.getDay() === 0
  return isSunday ? raw : raw
}

function formatDuration(ms: number): string {
  if (ms <= 0) return 'Expired'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Live countdown to reservation expiry. Updates every second.
 * Pauses on Sundays (school is closed; Sunday doesn't count as a pickup day).
 */
export function ReservationCountdown({ expiresAt }: ReservationCountdownProps) {
  const [ms, setMs] = useState(() => computeMs(expiresAt))

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const isSunday = now.getDay() === 0
      if (!isSunday) {
        setMs(computeMs(expiresAt))
      }
    }
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const isSunday = new Date().getDay() === 0
  const isUrgent = ms > 0 && ms < 60 * 60 * 1000
  const isExpired = ms === 0

  if (isSunday) {
    return (
      <span className="text-sm font-medium text-amber-600 dark:text-amber-400" aria-live="polite">
        Paused — Sunday
      </span>
    )
  }

  return (
    <span
      className={
        isExpired
          ? 'text-sm text-muted-foreground'
          : isUrgent
            ? 'text-sm font-mono font-medium text-danger'
            : 'text-sm font-mono font-medium text-foreground'
      }
      aria-live="polite"
      aria-label={`Time remaining: ${formatDuration(ms)}`}
    >
      {formatDuration(ms)}
    </span>
  )
}
