import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export type CardVariant = 'surface' | 'elevated' | 'glass' | 'ghost'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  /** When true, wraps children in a padded section (p-5). */
  padded?: boolean
}

const variants: Record<CardVariant, string> = {
  surface:
    'bg-surface border border-border rounded-2xl shadow-[var(--shadow-xs)]',

  elevated:
    'bg-surface border border-border rounded-2xl shadow-[var(--shadow-sm)] ' +
    'transition-all duration-200 ' +
    'hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] hover:border-border/60',

  glass:
    'glass border border-white/20 dark:border-white/8 rounded-2xl shadow-[var(--shadow-md)]',

  ghost:
    'rounded-2xl',
}

export function Card({ variant = 'surface', padded = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        variants[variant],
        padded && 'p-5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/** Pre-styled card sections for consistent internal layout */
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between px-5 py-4 border-b border-border', className)}
      {...props}
    />
  )
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 px-5 py-4 border-t border-border', className)}
      {...props}
    />
  )
}
