import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type Variant = 'error' | 'success' | 'info'

interface AlertProps {
  variant?: Variant
  children: ReactNode
  className?: string
}

const variants: Record<Variant, string> = {
  error: 'border-danger/40 bg-danger/10 text-danger',
  success: 'border-success/40 bg-success/10 text-success',
  info: 'border-primary/40 bg-primary/10 text-primary',
}

export function Alert({ variant = 'info', children, className }: AlertProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-lg border px-3 py-2.5 text-sm',
        variants[variant],
        className,
      )}
    >
      {children}
    </div>
  )
}
