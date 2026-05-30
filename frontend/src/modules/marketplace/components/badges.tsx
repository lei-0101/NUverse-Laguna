import { cn } from '@/shared/lib/cn'
import { formatCategory, formatCondition, formatStatus } from '../schemas'
import type { ListingCategory, ListingCondition, ListingStatus } from '../types'

function Pill({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function CategoryBadge({ category }: { category: ListingCategory }) {
  return <Pill className="bg-surface-muted text-muted-foreground">{formatCategory(category)}</Pill>
}

export function ConditionBadge({ condition }: { condition: ListingCondition }) {
  return <Pill className="bg-primary/10 text-primary">{formatCondition(condition)}</Pill>
}

const STATUS_STYLES: Record<ListingStatus, string> = {
  AVAILABLE: 'bg-success/10 text-success',
  SOLD: 'bg-surface-muted text-muted-foreground',
  REMOVED: 'bg-danger/10 text-danger',
  SUSPENDED: 'bg-danger/10 text-danger',
}

export function StatusBadge({ status }: { status: ListingStatus }) {
  return <Pill className={STATUS_STYLES[status]}>{formatStatus(status)}</Pill>
}
