import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Card, Input, Modal } from '@/shared/components/ui'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import { Confetti } from '@/shared/components/Confetti'
import { toApiError } from '@/shared/lib/apiClient'
import { useAuthStore } from '@/shared/store/authStore'
import { useThemeStore } from '@/shared/store/themeStore'
import { editExchangeProductPath, paths } from '@/shared/routes/paths'
import { cn } from '@/shared/lib/cn'
import { formatCategory, formatPrice, formatVariantLabel, variantFormSchema } from '../schemas'
import type { VariantFormValues } from '../schemas'
import {
  useAddVariant,
  useCreateReservation,
  useDeactivateProduct,
  useDeleteVariant,
  useProduct,
  useUpdateVariant,
  useUpdateVariantStock,
} from '../hooks/useBulldogExchange'
import { VariantSelector } from '../components/VariantSelector'
import { StockBadge } from '../components/StockBadge'
import type { ProductVariant } from '../types'

const RESERVATION_FEE = 50

function getLevelLabel(name: string): { label: string; color: string } | null {
  if (name.startsWith('[SHS]')) return { label: 'SHS', color: '#7c3aed' }
  if (name.startsWith('[College]') || name.startsWith('[COLLEGE]')) return { label: 'College', color: '#1f3a8a' }
  return null
}

function cleanName(name: string): string {
  return name.replace(/^\[(SHS|College|COLLEGE)\]\s*/i, '')
}

/** Full product detail page with variant selection, reservation, and admin management. */
export function ProductDetailPage() {
  const { productId = '' } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const isAdmin = user?.role === 'ROLE_ADMIN'

  const { data: product, isLoading, isError } = useProduct(productId)
  const createReservation = useCreateReservation()
  const deactivate = useDeactivateProduct()
  const addVariant = useAddVariant(productId)
  const updateStock = useUpdateVariantStock(productId)

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [reservationError, setReservationError] = useState<string>()
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showAddVariant, setShowAddVariant] = useState(false)
  const [stockEditing, setStockEditing] = useState<string | null>(null)
  const [stockValue, setStockValue] = useState('')
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null)
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)
  const [deleteVariantTarget, setDeleteVariantTarget] = useState<{ id: string; label: string } | null>(null)

  const variantForm = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: { size: '', color: '', sku: '', stock: '0', price: '' },
  })

  const editVariantForm = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: { size: '', color: '', sku: '', stock: '0', price: '' },
  })

  const updateVariant = useUpdateVariant(productId)
  const deleteVariant = useDeleteVariant(productId)

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

  const levelInfo = getLevelLabel(product.name)
  const displayName = cleanName(product.name)
  const displayDescription = product.description.replace(/^\[(SHS|College|COLLEGE)\]\s*/i, '')

  const canReserve =
    !isAdmin &&
    selectedVariant !== null &&
    selectedVariant.available &&
    product.active &&
    !product.limited

  const unitPrice = selectedVariant?.price ?? 0
  const totalPrice = unitPrice + RESERVATION_FEE

  const handleReserveClick = () => {
    if (!selectedVariantId) return
    setReservationError(undefined)
    setShowConfirm(true)
  }

  const handleConfirmReserve = () => {
    if (!selectedVariantId) return
    setShowConfirm(false)
    createReservation.mutate(selectedVariantId, {
      onSuccess: () => {
        setReservationSuccess(true)
        setShowConfetti(true)
      },
      onError: (err) => setReservationError(toApiError(err).message),
    })
  }

  const handleDeactivate = () => {
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

  const handleOpenEditVariant = (variant: ProductVariant) => {
    setEditingVariantId(variant.id)
    editVariantForm.reset({
      size: variant.size ?? '',
      color: variant.color ?? '',
      sku: variant.sku,
      stock: String(variant.stock),
      price: String(variant.price),
    })
  }

  const handleEditVariant = (values: VariantFormValues) => {
    if (!editingVariantId) return
    updateVariant.mutate(
      {
        variantId: editingVariantId,
        payload: {
          size: values.size || null,
          color: values.color || null,
          sku: values.sku,
          stock: parseInt(values.stock, 10),
          price: Number(values.price),
        },
      },
      {
        onSuccess: () => {
          setEditingVariantId(null)
          editVariantForm.reset()
        },
        onError: (err) => editVariantForm.setError('sku', { message: toApiError(err).message }),
      },
    )
  }

  const handleDeleteVariant = (variantId: string, label: string) => {
    setDeleteVariantTarget({ id: variantId, label })
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
        <div
          className={cn(
            'aspect-square w-full overflow-hidden rounded-2xl border',
            isDark ? 'border-white/10 bg-[#1a1d24]' : 'border-border bg-surface-muted',
          )}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={displayName}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="opacity-30">
                <rect x="2" y="2" width="20" height="20" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-sm">No image available</span>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-5">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
                isDark ? 'bg-white/8 text-muted-foreground' : 'bg-surface-muted text-muted-foreground',
              )}
            >
              {formatCategory(product.category)}
            </span>
            {levelInfo && (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wide text-white"
                style={{ background: levelInfo.color }}
              >
                {levelInfo.label}
              </span>
            )}
            {product.limited && (
              <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-black text-danger">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="4.5"/></svg>
                LIMITED — Display Only
              </span>
            )}
            {!product.active && (
              <span className="inline-flex items-center rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger">
                Inactive
              </span>
            )}
          </div>

          {/* Name + Price */}
          <div>
            <h1 className={cn('text-2xl font-black leading-tight', isDark ? 'text-white' : 'text-foreground')}>
              {displayName}
            </h1>
            {selectedVariant ? (
              <div className="mt-2">
                <span className="font-mono text-3xl font-black" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>
                  {formatPrice(selectedVariant.price)}
                </span>
                <span className="ml-2 text-sm text-muted-foreground">+ ₱{RESERVATION_FEE} reservation fee</span>
              </div>
            ) : product.variants.length > 0 ? (
              <p className="mt-2 text-lg text-muted-foreground">
                from{' '}
                <span className="font-mono font-bold" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>
                  {formatPrice(Math.min(...product.variants.map((v) => v.price)))}
                </span>
              </p>
            ) : null}
          </div>

          <p className={cn('whitespace-pre-wrap text-sm leading-relaxed', isDark ? 'text-white/70' : 'text-muted-foreground')}>
            {displayDescription}
          </p>

          <VariantSelector
            variants={product.variants}
            selectedId={selectedVariantId}
            onChange={setSelectedVariantId}
          />

          {selectedVariant && (
            <div className="flex items-center gap-3">
              <StockBadge stock={selectedVariant.stock} />
              {/* Quantity selector */}
              {!isAdmin && canReserve && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Qty:</span>
                  <div className={cn(
                    'flex items-center gap-1 rounded-lg border',
                    isDark ? 'border-white/10 bg-white/[0.03]' : 'border-border bg-surface',
                  )}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-foreground">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(2, quantity + 1))}
                      disabled={quantity >= 2}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Max 2</span>
                </div>
              )}
            </div>
          )}

          {/* Student reservation section */}
          {!isAdmin && product.active && !product.limited && (
            <div
              className={cn(
                'space-y-3 rounded-2xl border p-4',
                isDark ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-200 bg-amber-50',
              )}
            >
              {selectedVariant && (
                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">Reservation Summary</p>
                    <p className="text-xs text-muted-foreground">Item price + ₱{RESERVATION_FEE} handling fee</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-black" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>
                      {formatPrice(totalPrice * quantity)}
                    </p>
                    {quantity > 1 && (
                      <p className="text-xs text-muted-foreground">for {quantity} items</p>
                    )}
                  </div>
                </div>
              )}

              {reservationSuccess && (
                <Alert variant="success">
                  Reservation created! Please pick up your item within 48 hours (Sundays excluded).
                </Alert>
              )}
              {reservationError && <Alert variant="error">{reservationError}</Alert>}

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  disabled={!canReserve}
                  isLoading={createReservation.isPending}
                  onClick={handleReserveClick}
                  className="flex-1"
                  style={canReserve ? {
                    background: 'linear-gradient(135deg, #d97706, #f5b300)',
                    color: '#1a1d24',
                    borderColor: 'transparent',
                  } : undefined}
                >
                  Reserve Now
                </Button>
                <Button variant="secondary" onClick={() => navigate(paths.myReservations)}>
                  My Reservations
                </Button>
              </div>

              {!selectedVariant && product.variants.length > 0 && (
                <p className="text-xs text-muted-foreground">Select a size/variant above to reserve.</p>
              )}
              {selectedVariant && !selectedVariant.available && (
                <p className="text-xs text-danger">This variant is out of stock. Please select another.</p>
              )}
              <p className="text-[11px] text-muted-foreground">
                Reserved items must be claimed within 48 hours (Sundays do not count). Unclaimed reservations expire automatically.
              </p>
            </div>
          )}

          {/* Limited product notice */}
          {!isAdmin && product.limited && (
            <div className={cn(
              'rounded-2xl border p-4 text-sm',
              isDark ? 'border-red-500/20 bg-red-500/5' : 'border-red-200 bg-red-50',
            )}>
              <p className="font-bold text-danger">Limited Display Product</p>
              <p className="mt-1 text-xs text-muted-foreground">
                This item is displayed for reference only and cannot be reserved through the online system. Please visit the Bulldog Exchange counter directly to inquire.
              </p>
            </div>
          )}

          {/* Admin management */}
          {isAdmin && (
            <div className="space-y-4 border-t border-border pt-4">
              <p className="text-sm font-medium text-muted-foreground">Admin actions</p>
              <div className="flex flex-wrap gap-2">
                <Link to={editExchangeProductPath(productId)}>
                  <Button variant="secondary" size="sm">
                    ✏️ Edit Product
                  </Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={() => setShowAddVariant(true)}>
                  Add variant
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeactivateConfirm(true)}
                  disabled={!product.active}
                >
                  Deactivate product
                </Button>
              </div>

              {product.variants.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Variant management
                  </p>
                  {product.variants.map((variant) => (
                    <Card key={variant.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                      <div className="text-sm min-w-0">
                        <span className="font-medium text-foreground">
                          {formatVariantLabel(variant.size, variant.color)}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">SKU: {variant.sku}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ₱{variant.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
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
                            <Button size="sm" variant="ghost" onClick={() => setStockEditing(null)}>
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
                              Stock
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleOpenEditVariant(variant)}
                            >
                              ✏️ Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              isLoading={deleteVariant.isPending}
                              onClick={() => handleDeleteVariant(
                                variant.id,
                                formatVariantLabel(variant.size, variant.color),
                              )}
                            >
                              🗑 Delete
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

      {/* ── Reservation Confirmation Modal ─────────────────── */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Reservation"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              isLoading={createReservation.isPending}
              onClick={handleConfirmReserve}
              style={{
                background: 'linear-gradient(135deg, #d97706, #f5b300)',
                color: '#1a1d24',
                borderColor: 'transparent',
              }}
            >
              Confirm & Reserve
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className={cn(
            'rounded-xl border p-4',
            isDark ? 'border-white/10 bg-white/[0.03]' : 'border-border bg-surface-muted/40',
          )}>
            <p className="font-semibold text-foreground">{displayName}</p>
            {selectedVariant && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {formatVariantLabel(selectedVariant.size, selectedVariant.color)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Item price</span>
              <span className="font-mono font-semibold text-foreground">{formatPrice(unitPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Reservation handling fee</span>
              <span className="font-mono font-semibold text-foreground">+ ₱{RESERVATION_FEE}.00</span>
            </div>
            {quantity > 1 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-mono font-semibold text-foreground">× {quantity}</span>
              </div>
            )}
            <div
              className={cn(
                'flex items-center justify-between rounded-lg border-t pt-2 text-sm font-black',
                isDark ? 'border-white/10' : 'border-border',
              )}
            >
              <span className="text-foreground">Total to pay at counter</span>
              <span className="font-mono text-lg" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>
                {formatPrice(totalPrice * quantity)}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            By confirming, you agree to pick up your item within <strong>48 hours</strong> (Sundays excluded). Failure to claim will automatically cancel your reservation.
          </p>
        </div>
      </Modal>

      {/* ── Deactivate Product Confirm ────────────────────── */}
      <ConfirmModal
        isOpen={showDeactivateConfirm}
        onClose={() => setShowDeactivateConfirm(false)}
        onConfirm={handleDeactivate}
        title="Deactivate product?"
        message="This product will be hidden from the browse view. Existing reservations are unaffected. You can reactivate it later."
        confirmLabel="Deactivate"
        variant="warning"
        isLoading={deactivate.isPending}
      />

      {/* ── Delete Variant Confirm ─────────────────────────── */}
      <ConfirmModal
        isOpen={deleteVariantTarget !== null}
        onClose={() => setDeleteVariantTarget(null)}
        onConfirm={() => {
          if (!deleteVariantTarget) return
          deleteVariant.mutate(deleteVariantTarget.id, {
            onSuccess: () => setDeleteVariantTarget(null),
          })
        }}
        title="Delete variant?"
        message={`"${deleteVariantTarget?.label ?? ''}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteVariant.isPending}
      />

      {/* ── Edit Variant Modal ─────────────────────────────── */}
      <Modal
        isOpen={editingVariantId !== null}
        onClose={() => { setEditingVariantId(null); editVariantForm.reset() }}
        title="Edit variant"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setEditingVariantId(null); editVariantForm.reset() }}>
              Cancel
            </Button>
            <Button form="edit-variant-form" type="submit" isLoading={updateVariant.isPending}>
              Save changes
            </Button>
          </>
        }
      >
        <form
          id="edit-variant-form"
          onSubmit={editVariantForm.handleSubmit(handleEditVariant)}
          className="space-y-4"
        >
          <Input
            label="Size (optional)"
            placeholder="e.g. XS, S, M, L, XL, 2XL, 3XL"
            error={editVariantForm.formState.errors.size?.message}
            {...editVariantForm.register('size')}
          />
          <Input
            label="Color (optional)"
            placeholder="e.g. Blue, White, Navy Blue"
            error={editVariantForm.formState.errors.color?.message}
            {...editVariantForm.register('color')}
          />
          <Input
            label="SKU"
            placeholder="Unique identifier"
            error={editVariantForm.formState.errors.sku?.message}
            {...editVariantForm.register('sku')}
          />
          <Input
            label="Stock"
            type="number"
            min="0"
            error={editVariantForm.formState.errors.stock?.message}
            {...editVariantForm.register('stock')}
          />
          <Input
            label="Price (PHP)"
            placeholder="0.00"
            error={editVariantForm.formState.errors.price?.message}
            {...editVariantForm.register('price')}
          />
        </form>
      </Modal>

      {/* ── Add Variant Modal ──────────────────────────────── */}
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
            placeholder="e.g. XS, S, M, L, XL, 2XL, 3XL"
            error={variantForm.formState.errors.size?.message}
            {...variantForm.register('size')}
          />
          <Input
            label="Color (optional)"
            placeholder="e.g. Blue, White, Navy Blue"
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
