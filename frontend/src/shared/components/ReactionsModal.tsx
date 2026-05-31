import { useThemeStore } from '@/shared/store/themeStore'
import { cn } from '@/shared/lib/cn'

export interface ReactionSummary {
  userId: string
  fullName: string
  avatarUrl: string | null
  emoji: string
}

interface ReactionsModalProps {
  isOpen: boolean
  onClose: () => void
  reactions: ReactionSummary[]
  isLoading?: boolean
}

export function ReactionsModal({ isOpen, onClose, reactions, isLoading }: ReactionsModalProps) {
  const isDark = useThemeStore((s) => s.theme === 'dark')

  if (!isOpen) return null

  // Group by emoji
  const byEmoji = reactions.reduce<Record<string, ReactionSummary[]>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = []
    acc[r.emoji].push(r)
    return acc
  }, {})

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(4,7,18,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={cn(
          'w-full max-w-md overflow-hidden rounded-2xl border',
          isDark ? 'border-white/10 bg-[#12141a]' : 'border-border bg-white',
        )}
        style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center justify-between border-b px-5 py-4',
          isDark ? 'border-white/8' : 'border-border',
        )}>
          <p className={cn('text-sm font-bold', isDark ? 'text-white' : 'text-foreground')}>
            Reactions · {reactions.length}
          </p>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-surface-muted"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Emoji filter tabs */}
        {Object.keys(byEmoji).length > 1 && (
          <div className={cn('flex gap-1 overflow-x-auto px-4 py-2 border-b', isDark ? 'border-white/6' : 'border-border')}>
            <button
              className={cn(
                'shrink-0 rounded-lg px-3 py-1 text-xs font-bold transition-colors',
                'bg-primary/10 text-primary',
              )}
            >
              All {reactions.length}
            </button>
            {Object.entries(byEmoji).map(([emoji, items]) => (
              <button key={emoji} className="shrink-0 rounded-lg border border-border px-3 py-1 text-xs font-bold transition-colors hover:bg-surface-muted">
                {emoji} {items.length}
              </button>
            ))}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton h-8 w-8 rounded-full" />
                  <div className="skeleton h-4 w-32 rounded" />
                </div>
              ))}
            </div>
          ) : reactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-3xl mb-2">💭</p>
              <p className="text-sm text-muted-foreground">No reactions yet</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
              {reactions.map((r, i) => {
                const initials = r.fullName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
                return (
                  <div key={`${r.userId}-${i}`} className="flex items-center gap-3 px-5 py-3">
                    {r.avatarUrl ? (
                      <img src={r.avatarUrl} alt={r.fullName} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 100%)' }}
                      >
                        {initials}
                      </span>
                    )}
                    <p className={cn('flex-1 text-sm font-medium', isDark ? 'text-white' : 'text-foreground')}>
                      {r.fullName}
                    </p>
                    <span className="text-lg">{r.emoji}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
