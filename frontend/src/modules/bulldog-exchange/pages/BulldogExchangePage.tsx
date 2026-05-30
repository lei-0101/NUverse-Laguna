import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui'
import { cn } from '@/shared/lib/cn'
import { useAuthStore } from '@/shared/store/authStore'
import { paths } from '@/shared/routes/paths'
import { MERCHANDISE_CATEGORIES, formatCategory } from '../schemas'
import { useProducts } from '../hooks/useBulldogExchange'
import { ProductGrid } from '../components/ProductGrid'
import type { MerchandiseCategory } from '../types'

/** Browse all active NU merchandise with category filtering. */
export function BulldogExchangePage() {
  const [category, setCategory] = useState<MerchandiseCategory | null>(null)
  const [page, setPage] = useState(0)
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'ROLE_ADMIN'

  const { data, isLoading, isError } = useProducts(category, page)

  const handleCategoryChange = (next: MerchandiseCategory | null) => {
    setCategory(next)
    setPage(0)
  }

  return (
    <div className="space-y-6 animate-[page-enter_0.3s_ease-out]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Bulldog Exchange</h1>
          <p className="text-sm text-muted-foreground">Official NU Laguna merchandise. Reserve yours today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(paths.myReservations)}>
            My reservations
          </Button>
          {isAdmin && (
            <Button onClick={() => navigate(paths.exchangeNew)}>
              + New product
            </Button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Product categories">
        <button
          role="tab"
          aria-selected={category === null}
          onClick={() => handleCategoryChange(null)}
          className={cn(
            'rounded-full px-3 py-1 text-sm font-medium transition-colors',
            category === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-surface-muted text-muted-foreground hover:text-foreground',
          )}
        >
          All
        </button>
        {MERCHANDISE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={category === cat}
            onClick={() => handleCategoryChange(cat)}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              category === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface-muted text-muted-foreground hover:text-foreground',
            )}
          >
            {formatCategory(cat)}
          </button>
        ))}
      </div>

      <ProductGrid
        products={data?.content}
        isLoading={isLoading}
        isError={isError}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        emptyTitle="No products available"
        emptyDescription={
          category
            ? `No ${formatCategory(category).toLowerCase()} products right now. Check back soon.`
            : 'No merchandise is available at the moment. Check back soon.'
        }
      />
    </div>
  )
}
