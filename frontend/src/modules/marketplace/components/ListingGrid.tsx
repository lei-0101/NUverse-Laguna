import { Alert, EmptyState, Pagination } from '@/shared/components/ui'
import type { ListingCard as ListingCardModel } from '../types'
import { ListingCard } from './ListingCard'

function ListingGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-border bg-surface p-3">
          <div className="skeleton aspect-square w-full rounded-lg" />
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-5 w-1/3 rounded" />
        </div>
      ))}
    </div>
  )
}

interface ListingGridProps {
  listings: ListingCardModel[] | undefined
  isLoading: boolean
  isError: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  emptyTitle: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
}

/** Handles the loading / error / empty / populated states for any listing grid. */
export function ListingGrid({
  listings,
  isLoading,
  isError,
  page,
  totalPages,
  onPageChange,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: ListingGridProps) {
  if (isLoading) return <ListingGridSkeleton />
  if (isError) return <Alert variant="error">We couldn't load these listings. Please try again.</Alert>
  if (!listings || listings.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}
