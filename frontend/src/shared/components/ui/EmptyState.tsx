import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface EmptyStateProps {
  /** Large emoji or SVG shown as the visual anchor (e.g. "🐾", "🛒") */
  icon?: string | ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
  /** Compact mode — less vertical padding, smaller text */
  compact?: boolean
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-2 py-8' : 'gap-3 py-14',
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-surface-muted',
            compact ? 'h-12 w-12 text-2xl' : 'h-16 w-16 text-3xl',
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h3
          className={cn(
            'font-semibold text-foreground',
            compact ? 'text-sm' : 'text-base',
          )}
        >
          {title}
        </h3>
        {description && (
          <p
            className={cn(
              'text-muted-foreground max-w-xs',
              compact ? 'text-xs' : 'text-sm',
            )}
          >
            {description}
          </p>
        )}
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
