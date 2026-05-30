import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui'
import { paths } from '@/shared/routes/paths'
import { useListings } from '../hooks/useMarketplace'
import { MarketplaceFilters } from '../components/MarketplaceFilters'
import { ListingGrid } from '../components/ListingGrid'
import type { ListingFilters } from '../types'

/** Browse all available listings with search, filtering, and pagination. */
export function MarketplacePage() {
  const [filters, setFilters] = useState<ListingFilters>({})
  const [page, setPage] = useState(0)
  const navigate = useNavigate()
  const { data, isLoading, isError } = useListings(filters, page)

  const applyFilters = (next: ListingFilters) => {
    setFilters(next)
    setPage(0)
  }

  return (
    <div className="flex flex-col gap-6 animate-[page-enter_0.3s_ease-out]">
      {/* ── Atmospheric header ──────────────────────────────────────── */}
      <div
        className="relative -mx-4 -mt-8 overflow-hidden px-4 pt-8 pb-6 sm:-mx-6 sm:px-6"
        style={{
          background:
            'radial-gradient(ellipse at 10% 70%, rgba(52,211,153,0.14) 0%, transparent 50%),' +
            'radial-gradient(ellipse at 80% 20%, rgba(20,184,166,0.10) 0%, transparent 50%),' +
            'radial-gradient(ellipse at 55% 90%, rgba(245,179,0,0.07) 0%, transparent 45%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 dark:hidden"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(52,211,153,0.15) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            opacity: 0.35,
          }}
        />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              Campus Store
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Marketplace
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Buy and sell within the NU Laguna community.
            </p>
          </div>
          <div className="flex gap-2 mt-1">
            <Button variant="secondary" size="sm" onClick={() => navigate(paths.savedListings)}>
              Saved
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(paths.myListings)}>
              My listings
            </Button>
            <Button size="sm" onClick={() => navigate(paths.marketplaceNew)}>+ New listing</Button>
          </div>
        </div>

        {data && (
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {data.totalElements} listing{data.totalElements !== 1 ? 's' : ''} available
          </div>
        )}
      </div>

      <MarketplaceFilters initial={filters} onApply={applyFilters} />

      <ListingGrid
        listings={data?.content}
        isLoading={isLoading}
        isError={isError}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        emptyTitle="No listings found"
        emptyDescription="Try adjusting your filters, or be the first to post something."
      />
    </div>
  )
}
