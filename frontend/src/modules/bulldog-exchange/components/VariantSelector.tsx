import { cn } from '@/shared/lib/cn'
import { formatPrice, formatVariantLabel } from '../schemas'
import type { ProductVariant } from '../types'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedId: string | null
  onChange: (variantId: string) => void
}

/**
 * Radio-group style variant picker. Shows size/color label, price, and stock
 * availability. Unavailable variants are shown dimmed but still selectable
 * so the user can see what exists.
 */
export function VariantSelector({ variants, selectedId, onChange }: VariantSelectorProps) {
  if (variants.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No variants available for this product.
      </p>
    )
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-foreground">Select variant</legend>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId
          return (
            <button
              key={variant.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(variant.id)}
              className={cn(
                'flex flex-col items-start rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isSelected
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border bg-surface text-foreground hover:border-primary/50',
                !variant.available && 'opacity-50',
              )}
            >
              <span className="font-medium">
                {formatVariantLabel(variant.size, variant.color)}
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">
                {formatPrice(variant.price)}
                {!variant.available && ' · Out of stock'}
                {variant.available && variant.stock <= 5 && ` · Only ${variant.stock} left`}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
