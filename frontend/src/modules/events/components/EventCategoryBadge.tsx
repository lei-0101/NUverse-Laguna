import { cn } from '@/shared/lib/cn'
import type { EventCategory } from '../types'

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  ACADEMIC: 'Academic',
  CULTURAL: 'Cultural',
  SPORTS: 'Sports',
  SEMINAR: 'Seminar',
  SOCIAL: 'Social',
  OTHER: 'Other',
}

const CATEGORY_COLORS: Record<EventCategory, string> = {
  ACADEMIC: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  CULTURAL: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  SPORTS: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  SEMINAR: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  SOCIAL: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  OTHER: 'bg-surface-muted text-muted-foreground',
}

interface Props {
  category: EventCategory
  className?: string
}

export function EventCategoryBadge({ category, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        CATEGORY_COLORS[category],
        className,
      )}
    >
      {EVENT_CATEGORY_LABELS[category]}
    </span>
  )
}
