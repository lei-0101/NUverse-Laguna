import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui'
import { marketplaceListingPath } from '@/shared/routes/paths'
import { formatPrice } from '../schemas'
import type { ListingCard as ListingCardModel } from '../types'
import { useTilt } from '@/shared/hooks/useTilt'
import { cn } from '@/shared/lib/cn'

interface ListingCardProps {
  listing: ListingCardModel
}

const CONDITION_CONFIG: Record<string, { label: string; color: Parameters<typeof Badge>[0]['color'] }> = {
  NEW:      { label: 'New',      color: 'emerald' },
  LIKE_NEW: { label: 'Like New', color: 'emerald' },
  GOOD:     { label: 'Good',     color: 'blue'    },
  FAIR:     { label: 'Fair',     color: 'amber'   },
}

const CATEGORY_LABEL: Record<string, string> = {
  BOOKS:        'Books',
  ELECTRONICS:  'Electronics',
  CLOTHING:     'Clothing',
  SUPPLIES:     'Supplies',
  FOOD:         'Food',
  SERVICES:     'Services',
  OTHER:        'Other',
}

export function ListingCard({ listing }: ListingCardProps) {
  const { ref, tiltStyle, tiltHandlers } = useTilt<HTMLAnchorElement>({ maxDeg: 4 })
  const isSold      = listing.status === 'SOLD'
  const cond        = CONDITION_CONFIG[listing.condition]
  const catLabel    = CATEGORY_LABEL[listing.category] ?? listing.category

  return (
    <Link
      ref={ref}
      to={marketplaceListingPath(listing.id)}
      className="group block"
      style={tiltStyle}
      {...tiltHandlers}
    >
      <div
        className={cn(
          'flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface',
          'transition-all duration-200 group-hover:-translate-y-1.5 group-hover:shadow-[var(--shadow-lg)]',
          isSold && 'opacity-70',
        )}
      >
        {/* Image area */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
          {listing.thumbnailUrl ? (
            <img
              src={listing.thumbnailUrl}
              alt={listing.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl opacity-25" aria-hidden="true">
              🏷️
            </div>
          )}

          {/* SOLD diagonal ribbon */}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45">
              <span className="rounded-full bg-gray-800/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
                Sold
              </span>
            </div>
          )}

          {/* "New" subtle badge for fresh listings */}
          {!isSold && listing.status === 'AVAILABLE' && (
            <div className="absolute left-2.5 top-2.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                New
              </span>
            </div>
          )}

          {/* Price badge — always visible in bottom-right of image */}
          <div className="absolute bottom-2.5 right-2.5">
            <span className="rounded-lg bg-black/60 px-2.5 py-1 font-mono text-sm font-bold tabular-nums text-white backdrop-blur-sm">
              {formatPrice(listing.price)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
            {listing.title}
          </h3>

          <div className="mt-auto flex flex-wrap items-center gap-1.5">
            {catLabel && (
              <Badge variant="soft" color="gray" size="sm">{catLabel}</Badge>
            )}
            {cond && (
              <Badge variant="soft" color={cond.color} size="sm">{cond.label}</Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
