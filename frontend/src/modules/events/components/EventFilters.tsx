import { Button } from '@/shared/components/ui'
import type { EventCategory, EventStatus } from '../types'
import { EVENT_CATEGORY_LABELS } from './EventCategoryBadge'
import { cn } from '@/shared/lib/cn'

export interface EventFiltersValue {
  category?: EventCategory
  status?: EventStatus
  upcomingOnly?: boolean
}

interface Props {
  value: EventFiltersValue
  onChange: (v: EventFiltersValue) => void
}

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const selectClass =
  'h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground ' +
  'transition-colors focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer'

export function EventFilters({ value, onChange }: Props) {
  const handleCategory = (v: string) =>
    onChange({ ...value, category: v ? (v as EventCategory) : undefined })

  const handleStatus = (v: string) =>
    onChange({ ...value, status: v ? (v as EventStatus) : undefined })

  const handleUpcoming = () =>
    onChange({ ...value, upcomingOnly: !value.upcomingOnly })

  const handleReset = () => onChange({})

  const hasFilters = !!(value.category || value.status || value.upcomingOnly)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={value.category ?? ''}
        onChange={(e) => handleCategory(e.target.value)}
        aria-label="Filter by category"
        className={cn(selectClass, 'w-40')}
      >
        <option value="">All categories</option>
        {(Object.entries(EVENT_CATEGORY_LABELS) as [EventCategory, string][]).map(([k, label]) => (
          <option key={k} value={k}>{label}</option>
        ))}
      </select>

      <select
        value={value.status ?? ''}
        onChange={(e) => handleStatus(e.target.value)}
        aria-label="Filter by status"
        className={cn(selectClass, 'w-36')}
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleUpcoming}
        className={cn(
          'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
          value.upcomingOnly
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border bg-surface text-muted-foreground hover:text-foreground',
        )}
        aria-pressed={value.upcomingOnly ?? false}
      >
        Upcoming only
      </button>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
