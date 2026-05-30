import { cn } from '@/shared/lib/cn'

interface StockBadgeProps {
  stock: number
  /** When true, shows a compact dot-only indicator. */
  compact?: boolean
}

/**
 * Shows stock availability with contextual color:
 * - Out of stock → red
 * - Low stock (1–5) → yellow
 * - In stock → green
 */
export function StockBadge({ stock, compact = false }: StockBadgeProps) {
  const outOfStock = stock === 0
  const lowStock = stock > 0 && stock <= 5

  const dotClass = cn(
    'inline-block h-2 w-2 rounded-full',
    outOfStock && 'bg-danger',
    lowStock && 'bg-accent',
    !outOfStock && !lowStock && 'bg-success',
  )

  if (compact) {
    return <span className={dotClass} aria-hidden="true" />
  }

  const label = outOfStock ? 'Out of stock' : lowStock ? `Only ${stock} left` : 'In stock'

  const pillClass = cn(
    'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
    outOfStock && 'bg-danger/10 text-danger',
    lowStock && 'bg-accent/10 text-accent-foreground',
    !outOfStock && !lowStock && 'bg-success/10 text-success',
  )

  return (
    <span className={pillClass}>
      <span className={dotClass} aria-hidden="true" />
      {label}
    </span>
  )
}
