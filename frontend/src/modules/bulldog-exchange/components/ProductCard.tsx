import { Link } from 'react-router-dom'
import { Card } from '@/shared/components/ui'
import { cn } from '@/shared/lib/cn'
import { exchangeProductPath } from '@/shared/routes/paths'
import { formatCategory, formatPrice } from '../schemas'
import type { ProductCard as ProductCardModel } from '../types'
import { StockBadge } from './StockBadge'
import { useTilt } from '@/shared/hooks/useTilt'

interface ProductCardProps {
  product: ProductCardModel
}

/** Dumb card showing a product image, price, category, and stock status. */
export function ProductCard({ product }: ProductCardProps) {
  const { ref, tiltStyle, tiltHandlers } = useTilt<HTMLAnchorElement>({ maxDeg: 5 })
  return (
    <Link ref={ref} to={exchangeProductPath(product.id)} className="group block" style={tiltStyle} {...tiltHandlers}>
      <Card className="flex h-full flex-col overflow-hidden p-0 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-accent/10">
        <div className="relative aspect-square w-full overflow-hidden bg-surface-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
          {!product.hasStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded bg-danger px-2 py-0.5 text-xs font-semibold text-white">
                Out of stock
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <h3 className={cn(
            'line-clamp-2 text-sm font-semibold transition-colors group-hover:text-primary',
            product.hasStock ? 'text-foreground' : 'text-muted-foreground',
          )}>
            {product.name}
          </h3>
          <p className="font-mono tabular-nums text-base font-bold text-accent">
            from {formatPrice(product.minPrice)}
          </p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-1.5">
            <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {formatCategory(product.category)}
            </span>
            <StockBadge stock={product.hasStock ? 999 : 0} compact />
          </div>
        </div>
      </Card>
    </Link>
  )
}
