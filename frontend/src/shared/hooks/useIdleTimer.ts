import { useEffect, useRef, useCallback } from 'react'

const IDLE_TIMEOUT_MS = 10 * 60 * 1000   // 10 minutes
const WARN_BEFORE_MS  =  1 * 60 * 1000   // warn 1 minute before logout
const CHECK_INTERVAL_MS = 30 * 1000       // check every 30 s

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const

interface IdleTimerOptions {
  onIdle: () => void
  onWarn?: () => void
  enabled?: boolean
}

/**
 * Calls onWarn when the user has been idle for 9 minutes, then onIdle at 10 minutes.
 * Resets on any mouse, keyboard, touch, or scroll activity.
 * Only active when enabled = true (default).
 */
export function useIdleTimer({ onIdle, onWarn, enabled = true }: IdleTimerOptions) {
  const lastActivityRef = useRef(Date.now())
  const warnedRef       = useRef(false)

  // Keep callback refs current so the interval closure never goes stale
  const onIdleRef = useRef(onIdle)
  const onWarnRef = useRef(onWarn)
  useEffect(() => { onIdleRef.current = onIdle }, [onIdle])
  useEffect(() => { onWarnRef.current = onWarn  }, [onWarn])

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
    warnedRef.current = false
  }, [])

  useEffect(() => {
    if (!enabled) return

    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, resetActivity, { passive: true }),
    )

    const interval = setInterval(() => {
      const idle = Date.now() - lastActivityRef.current

      if (idle >= IDLE_TIMEOUT_MS) {
        onIdleRef.current()
      } else if (idle >= IDLE_TIMEOUT_MS - WARN_BEFORE_MS && !warnedRef.current) {
        warnedRef.current = true
        onWarnRef.current?.()
      }
    }, CHECK_INTERVAL_MS)

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, resetActivity))
      clearInterval(interval)
    }
  }, [enabled, resetActivity])
}
