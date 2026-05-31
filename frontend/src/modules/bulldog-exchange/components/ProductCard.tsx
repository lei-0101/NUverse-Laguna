import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui'
import { cn } from '@/shared/lib/cn'
import { exchangeProductPath } from '@/shared/routes/paths'
import { formatCategory, formatPrice } from '../schemas'
import type { ProductCard as ProductCardModel } from '../types'
import { useTilt } from '@/shared/hooks/useTilt'

interface ProductCardProps {
  product: ProductCardModel
}

function StockIndicator({ hasStock }: { hasStock: boolean }) {
  if (!hasStock) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" aria-hidden="true" />
        Out of stock
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
      <span
        className="h-1.5 w-1.5 rounded-full bg-emerald-500"
        style={{ animation: 'dot-pulse 2s ease-in-out infinite' }}
        aria-hidden="true"
      />
      In stock
    </span>
  )
}

function getLevelTag(name: string): { label: string; bg: string; text: string } | null {
  if (name.startsWith('[SHS]')) return { label: 'SHS', bg: 'rgba(124,58,237,0.15)', text: '#7c3aed' }
  if (/^\[college\]/i.test(name)) return { label: 'College', bg: 'rgba(31,58,138,0.15)', text: '#1f3a8a' }
  return null
}

function cleanProductName(name: string): string {
  return name.replace(/^\[(SHS|College|COLLEGE)\]\s*/i, '')
}

export function ProductCard({ product }: ProductCardProps) {
  const { ref, tiltStyle, tiltHandlers } = useTilt<HTMLAnchorElement>({ maxDeg: 4 })
  const levelTag = getLevelTag(product.name)
  const displayName = cleanProductName(product.name)

  const isLimited = product.limited
  const showStock = !isLimited && product.hasStock
  const showOut = !isLimited && !product.hasStock

  return (
    <Link
      ref={ref}
      to={exchangeProductPath(product.id)}
      className="group block"
      style={tiltStyle}
      {...tiltHandlers}
    >
      <div
        className={cn(
          'flex h-full flex-col overflow-hidden rounded-2xl border bg-surface',
          'transition-all duration-200 group-hover:-translate-y-1.5 group-hover:shadow-[var(--shadow-lg)]',
          showStock
            ? 'border-border group-hover:border-accent/40'
            : 'border-border opacity-65',
        )}
      >
        {/* Image area */}
        <div
          className="relative aspect-square w-full overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(245,179,0,0.07) 0%, transparent 65%), var(--color-surface-muted)' }}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={displayName}
              loading="lazy"
              className={cn(
                'h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.04]',
                (showOut || isLimited) && 'grayscale',
              )}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl opacity-20" aria-hidden="true">
              🐾
            </div>
          )}

          {/* Out of stock overlay */}
          {showOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="rounded-full bg-gray-800/90 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                Out of stock
              </span>
            </div>
          )}

          {/* Limited overlay */}
          {isLimited && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full border border-red-400/50 bg-red-900/90 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-red-200">
                Display Only
              </span>
            </div>
          )}

          {/* Level tag — SHS or College */}
          {levelTag && (
            <div className="absolute left-2 top-2">
              <span
                className="block rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
                style={{ background: levelTag.bg, color: levelTag.text }}
              >
                {levelTag.label}
              </span>
            </div>
          )}

          {/* Gold "Official" ribbon — top right */}
          {!levelTag && (
            <div className="absolute right-0 top-3">
              <span
                className="block rounded-l-full pl-2.5 pr-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-900"
                style={{ background: 'linear-gradient(90deg, rgba(245,179,0,0.9), rgba(245,179,0,0.75))' }}
              >
                NU Official
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <h3
            className={cn(
              'line-clamp-2 text-sm font-semibold leading-snug transition-colors',
              showStock
                ? 'text-foreground group-hover:text-primary'
                : 'text-muted-foreground',
            )}
          >
            {displayName}
          </h3>

          <p className="font-mono tabular-nums text-base font-bold"
            style={{ color: 'var(--color-module-exchange)' }}>
            from {formatPrice(product.minPrice)}
          </p>

          <div className="mt-auto flex items-center justify-between gap-2">
            <Badge variant="soft" color="gray" size="sm">
              {formatCategory(product.category)}
            </Badge>
            {isLimited ? (
              <span className="text-[11px] font-medium text-danger">Limited</span>
            ) : (
              <StockIndicator hasStock={product.hasStock} />
            )}
          </div>
        </div>

        {/* Gold bottom accent line */}
        {showStock && (
          <div
            className="h-[3px] w-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(245,179,0,0.8), transparent)' }}
            aria-hidden="true"
          />
        )}
      </div>
    </Link>
  )
}
