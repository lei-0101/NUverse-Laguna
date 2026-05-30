import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface shadow-sm transition-all duration-200',
        className,
      )}
      {...props}
    />
  )
}
