import { Link } from 'react-router-dom'
import { Card } from '@/shared/components/ui'
import { marketplaceListingPath } from '@/shared/routes/paths'
import { formatPrice } from '../schemas'
import type { ListingCard as ListingCardModel } from '../types'
import { CategoryBadge, ConditionBadge, StatusBadge } from './badges'
import { useTilt } from '@/shared/hooks/useTilt'

interface ListingCardProps {
  listing: ListingCardModel
}

/** Dumb card showing a listing thumbnail, price, and key metadata. */
export function ListingCard({ listing }: ListingCardProps) {
  const { ref, tiltStyle, tiltHandlers } = useTilt<HTMLAnchorElement>({ maxDeg: 5 })
  return (
    <Link ref={ref} to={marketplaceListingPath(listing.id)} className="group block" style={tiltStyle} {...tiltHandlers}>
      <Card className="flex h-full flex-col overflow-hidden p-0 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-primary/10">
        <div className="aspect-square w-full overflow-hidden bg-surface-muted">
          {listing.thumbnailUrl ? (
            <img
              src={listing.thumbnailUrl}
              alt={listing.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{listing.title}</h3>
            {listing.status !== 'AVAILABLE' && <StatusBadge status={listing.status} />}
          </div>
          <p className="font-mono tabular-nums text-lg font-bold text-accent">{formatPrice(listing.price)}</p>
          <div className="mt-auto flex flex-wrap gap-1.5">
            <CategoryBadge category={listing.category} />
            <ConditionBadge condition={listing.condition} />
          </div>
        </div>
      </Card>
    </Link>
  )
}
