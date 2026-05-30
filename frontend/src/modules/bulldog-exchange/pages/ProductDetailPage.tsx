import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Card, Input, Modal } from '@/shared/components/ui'
import { Confetti } from '@/shared/components/Confetti'
import { toApiError } from '@/shared/lib/apiClient'
import { useAuthStore } from '@/shared/store/authStore'
import { paths } from '@/shared/routes/paths'
import { formatCategory, formatPrice, formatVariantLabel, variantFormSchema } from '../schemas'
import type { VariantFormValues } from '../schemas'
import {
  useAddVariant,
  useCreateReservation,
  useDeactivateProduct,
  useProduct,
  useUpdateVariantStock,
} from '../hooks/useBulldogExchange'
import { VariantSelector } from '../components/VariantSelector'
import { StockBadge } from '../components/StockBadge'
import type { ProductVariant } from '../types'

/** Full product detail page with variant selection, reservation, and admin management. */
export function ProductDetailPage() {
  const { productId = '' } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'ROLE_ADMIN'

  const { data: product, isLoading, isError } = useProduct(productId)
  const createReservation = useCreateReservation()
  const deactivate = useDeactivateProduct()
  const addVariant = useAddVariant(productId)
  const updateStock = useUpdateVariantStock(productId)

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [reservationError, setReservationError] = useState<string>()
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showAddVariant, setShowAddVariant] = useState(false)
  const [stockEditing, setStockEditing] = useState<string | null>(null)
  const [stockValue, setStockValue] = useState('')

  const variantForm = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: { size: '', color: '', sku: '', stock: '0', price: '' },
  })

  if (isLoading) return (
    <div className="space-y-6 animate-[page-enter_0.3s_ease-out]">
      <div className="skeleton h-5 w-32 rounded" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="skeleton aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-4 w-20 rounded-full" />
          <div className="skeleton h-7 w-3/4 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
          <div className="space-y-2 pt-2">
            <div className="skeleton h-5 w-28 rounded" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-9 w-16 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="skeleton h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
  if (isError || !product) return <Alert variant="error">This product could not be loaded.</Alert>

  const selectedVariant: ProductVariant | null =
    product.variants.find((v) => v.id === selectedVariantId) ?? null

  const canReserve =
    !isAdmin &&
    selectedVariant !== null &&
    selectedVariant.available &&
    product.active

  const handleReserve = () => {
    if (!selectedVariantId) return
    setReservationError(undefined)
    setReservationSuccess(false)
    createReservation.mutate(selectedVariantId, {
      onSuccess: () => {
        setReservationSuccess(true)
        setShowConfetti(true)
      },
      onError: (err) => setReservationError(toApiError(err).message),
    })
  }

  const handleDeactivate = () => {
    if (!window.confirm('Deactivate this product? It will no longer appear in the browse view.')) return
    deactivate.mutate(productId, {
      onSuccess: () => navigate(paths.exchange),
    })
  }

  const handleAddVariant = (values: VariantFormValues) => {
    addVariant.mutate(
      {
        size: values.size || null,
        color: values.color || null,
        sku: values.sku,
        stock: parseInt(values.stock, 10),
        price: Number(values.price),
      },
      {
        onSuccess: () => {
          setShowAddVariant(false)
          variantForm.reset()
        },
        onError: (err) => variantForm.setError('sku', { message: toApiError(err).message }),
      },
    )
  }

  const handleSaveStock = (variantId: string) => {
    const parsed = parseInt(stockValue, 10)
    if (isNaN(parsed) || parsed < 0) {
      setStockEditing(null)
      return
    }
    updateStock.mutate(
      { variantId, payload: { stock: parsed } },
      { onSettled: () => setStockEditing(null) },
    )
  }

  return (
    <div className="space-y-6 animate-[page-enter_0.3s_ease-out]">
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
      <Button variant="ghost" size="sm" onClick={() => navigate(paths.exchange)}>
        ← Back to Exchange
      </Button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Product image */}
        <div className="aspect-square w-full overflow-hidden rounded-xl border border-border bg-surface-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-5">
          <div className="space-y-1">
            <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {formatCategory(product.category)}
            </span>
            {!product.active && (
              <span className="ml-2 inline-flex items-center rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                Inactive
              </span>
            )}
            <h1 className="text-2xl font-semibold text-foreground">{product.name}</h1>
            {selectedVariant && (
              <p className="text-3xl font-bold text-foreground">
                {formatPrice(selectedVariant.price)}
              </p>
            )}
            {!selectedVariant && product.variants.length > 0 && (
              <p className="text-lg text-muted-foreground">
                from {formatPrice(Math.min(...product.variants.map((v) => v.price)))}
              </p>
            )}
          </div>

          <div className="whitespace-pre-wrap text-sm text-foreground">{product.description}</div>

          <VariantSelector
            variants={product.variants}
            selectedId={selectedVariantId}
            onChange={setSelectedVariantId}
          />

          {selectedVariant && (
            <div className="flex items-center gap-2">
              <StockBadge stock={selectedVariant.stock} />
            </div>
          )}

          {/* Student reservation actions */}
          {!isAdmin && product.active && (
            <div className="space-y-2 border-t border-border pt-4">
              {reservationSuccess && (
                <Alert variant="success">
                  Reservation created! Please pick up your item within 48 hours.
                </Alert>
              )}
              {reservationError && <Alert variant="error">{reservationError}</Alert>}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  disabled={!canReserve}
                  isLoading={createReservation.isPending}
                  onClick={handleReserve}
                >
                  Reserve now
                </Button>
                <Button variant="secondary" onClick={() => navigate(paths.myReservations)}>
                  My reservations
                </Button>
              </div>
              {!selectedVariant && product.variants.length > 0 && (
                <p className="text-xs text-muted-foreground">Select a variant to reserve.</p>
              )}
              {selectedVariant && !selectedVariant.available && (
                <p className="text-xs text-danger">
                  This variant is out of stock. Please select another.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Reserved items must be picked up within 48 hours or the reservation will expire.
              </p>
            </div>
          )}

          {/* Admin management */}
          {isAdmin && (
            <div className="space-y-4 border-t border-border pt-4">
              <p className="text-sm font-medium text-muted-foreground">Admin actions</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowAddVariant(true)}>
                  Add variant
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={deactivate.isPending}
                  onClick={handleDeactivate}
                  disabled={!product.active}
                >
                  Deactivate product
                </Button>
              </div>

              {/* Admin stock management per variant */}
              {product.variants.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Variant stock
                  </p>
                  {product.variants.map((variant) => (
                    <Card key={variant.id} className="flex items-center justify-between gap-4 p-3">
                      <div className="text-sm">
                        <span className="font-medium text-foreground">
                          {formatVariantLabel(variant.size, variant.color)}
                        </span>
                        <span className="ml-2 text-muted-foreground">SKU: {variant.sku}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {stockEditing === variant.id ? (
                          <>
                            <Input
                              type="number"
                              min="0"
                              value={stockValue}
                              onChange={(e) => setStockValue(e.target.value)}
                              className="h-8 w-20 py-1 text-sm"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              isLoading={updateStock.isPending}
                              onClick={() => handleSaveStock(variant.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setStockEditing(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <StockBadge stock={variant.stock} />
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setStockEditing(variant.id)
                                setStockValue(String(variant.stock))
                              }}
                            >
                              Edit stock
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add variant modal */}
      <Modal
        isOpen={showAddVariant}
        onClose={() => {
          setShowAddVariant(false)
          variantForm.reset()
        }}
        title="Add variant"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddVariant(false)
                variantForm.reset()
              }}
            >
              Cancel
            </Button>
            <Button
              form="add-variant-form"
              type="submit"
              isLoading={addVariant.isPending}
            >
              Add variant
            </Button>
          </>
        }
      >
        <form
          id="add-variant-form"
          onSubmit={variantForm.handleSubmit(handleAddVariant)}
          className="space-y-4"
        >
          <Input
            label="Size (optional)"
            placeholder="e.g. S, M, L, XL"
            error={variantForm.formState.errors.size?.message}
            {...variantForm.register('size')}
          />
          <Input
            label="Color (optional)"
            placeholder="e.g. Blue, White"
            error={variantForm.formState.errors.color?.message}
            {...variantForm.register('color')}
          />
          <Input
            label="SKU"
            placeholder="e.g. NU-SHIRT-M-BLUE"
            error={variantForm.formState.errors.sku?.message}
            {...variantForm.register('sku')}
          />
          <Input
            label="Stock"
            type="number"
            min="0"
            error={variantForm.formState.errors.stock?.message}
            {...variantForm.register('stock')}
          />
          <Input
            label="Price (PHP)"
            placeholder="0.00"
            error={variantForm.formState.errors.price?.message}
            {...variantForm.register('price')}
          />
        </form>
      </Modal>
    </div>
  )
}
