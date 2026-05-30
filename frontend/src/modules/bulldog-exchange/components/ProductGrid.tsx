import { Alert, EmptyState, Pagination } from '@/shared/components/ui'
import type { ProductCard as ProductCardModel } from '../types'
import { ProductCard } from './ProductCard'

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-border bg-surface p-3">
          <div className="skeleton aspect-square w-full rounded-lg" />
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-5 w-2/3 rounded" />
        </div>
      ))}
    </div>
  )
}

interface ProductGridProps {
  products: ProductCardModel[] | undefined
  isLoading: boolean
  isError: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  emptyTitle?: string
  emptyDescription?: string
}

/** Handles loading / error / empty / populated states for the product grid. */
export function ProductGrid({
  products,
  isLoading,
  isError,
  page,
  totalPages,
  onPageChange,
  emptyTitle = 'No products found',
  emptyDescription,
}: ProductGridProps) {
  if (isLoading) return <ProductGridSkeleton />
  if (isError) return <Alert variant="error">We couldn't load the products. Please try again.</Alert>
  if (!products || products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}
