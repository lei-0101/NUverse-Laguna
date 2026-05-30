import { useEffect, useState } from 'react'
import { msUntilExpiry } from '../schemas'

interface ReservationCountdownProps {
  expiresAt: string
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
 * Turns red when under 1 hour remains.
 */
export function ReservationCountdown({ expiresAt }: ReservationCountdownProps) {
  const [ms, setMs] = useState(() => msUntilExpiry(expiresAt))

  useEffect(() => {
    const id = setInterval(() => setMs(msUntilExpiry(expiresAt)), 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const isUrgent = ms > 0 && ms < 60 * 60 * 1000
  const isExpired = ms === 0

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
