import { useEffect, useRef, useState, type ReactElement } from 'react'
import { useToastStore, type Toast as ToastItem } from '@/shared/store/toastStore'
import { cn } from '@/shared/lib/cn'

const ICONS: Record<ToastItem['type'], ReactElement> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1"/>
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1"/>
      <path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2L14 13H2L8 2Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
      <path d="M8 7v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="11.5" r="0.5" fill="currentColor"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1"/>
      <path d="M8 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="5" r="0.75" fill="currentColor"/>
    </svg>
  ),
}

const STYLES: Record<ToastItem['type'], string> = {
  success: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
  error:   'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800',
  warning: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
  info:    'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
}

const PROGRESS: Record<ToastItem['type'], string> = {
  success: 'bg-emerald-500',
  error:   'bg-red-500',
  warning: 'bg-amber-500',
  info:    'bg-blue-500',
}

function ToastCard({ toast, onRemove }: { toast: ToastItem; onRemove: () => void }) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Slide in
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const step = 100 / (toast.duration / 50)
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p - step
        if (next <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current)
        }
        return Math.max(0, next)
      })
    }, 50)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [toast.duration])

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(onRemove, 250)
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'relative flex w-80 items-start gap-3 overflow-hidden rounded-xl border p-3.5 shadow-lg',
        'transition-all duration-250 ease-out',
        visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0',
        STYLES[toast.type],
      )}
    >
      <span className="mt-0.5 shrink-0">{ICONS[toast.type]}</span>
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={handleDismiss}
        className="shrink-0 rounded opacity-60 transition-opacity hover:opacity-100"
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 2l10 10M12 2L2 12"/>
        </svg>
      </button>
      {/* Progress bar */}
      <div
        className={cn('absolute bottom-0 left-0 h-0.5 transition-all duration-50 ease-linear', PROGRESS[toast.type])}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

/** Renders all active toasts in the bottom-right corner. Mount once in App.tsx. */
export function ToastContainer() {
  const { toasts, remove } = useToastStore()

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard toast={t} onRemove={() => remove(t.id)} />
        </div>
      ))}
    </div>
  )
}
