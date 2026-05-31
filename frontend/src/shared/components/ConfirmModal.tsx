import { cn } from '@/shared/lib/cn'
import { useThemeStore } from '@/shared/store/themeStore'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const isDark = useThemeStore((s) => s.theme === 'dark')

  if (!isOpen) return null

  const iconColor = variant === 'danger' ? '#ef4444' : '#f59e0b'
  const iconBg    = variant === 'danger' ? 'rgba(239,68,68,0.10)' : 'rgba(245,158,11,0.10)'
  const btnStyle  = variant === 'danger'
    ? { background: '#ef4444' }
    : { background: 'linear-gradient(135deg, #d97706, #f59e0b)' }

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,7,18,0.80)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={cn(
          'w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl animate-[page-enter_0.2s_ease-out]',
          isDark ? 'border-white/10 bg-[#13151c]' : 'border-border bg-white',
        )}
      >
        {/* Top accent stripe */}
        <div className="h-1 w-full" style={{ background: variant === 'danger'
          ? 'linear-gradient(90deg, #ef4444, #f87171)'
          : 'linear-gradient(90deg, #d97706, #fbbf24)',
        }} />

        <div className="p-6">
          {/* Icon + title */}
          <div className="flex items-start gap-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: iconBg }}
            >
              {variant === 'danger' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <h3 className={cn('text-base font-black', isDark ? 'text-white' : 'text-foreground')}>
                {title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={cn(
                'flex-1 rounded-xl border py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50',
                isDark ? 'border-white/10 hover:bg-white/5' : 'border-border hover:bg-surface-muted',
              )}
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:translate-y-0"
              style={btnStyle}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Working…
                </span>
              ) : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
