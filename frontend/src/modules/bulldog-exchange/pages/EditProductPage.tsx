import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Input, Select, Textarea } from '@/shared/components/ui'
import { toApiError } from '@/shared/lib/apiClient'
import { exchangeProductPath } from '@/shared/routes/paths'
import { categoryOptions, productFormSchema } from '../schemas'
import type { ProductFormValues } from '../schemas'
import { useProduct, useUpdateProduct } from '../hooks/useBulldogExchange'
import { ProductImageUploader } from '../components/ProductImageUploader'
import { useLeaveGuard } from '@/shared/hooks/useLeaveGuard'
import { useThemeStore } from '@/shared/store/themeStore'
import { cn } from '@/shared/lib/cn'

/** Admin-only page to edit an existing merchandise product. */
export function EditProductPage() {
  const { productId = '' } = useParams()
  const navigate = useNavigate()
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const { data: product, isLoading } = useProduct(productId)
  const updateProduct = useUpdateProduct(productId)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string>()
  const [isDirty, setIsDirty] = useState(false)
  useLeaveGuard(isDirty)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: '', description: '', category: 'CLOTHING', imageUrl: null },
  })

  useEffect(() => {
    if (!product) return
    reset({
      name: product.name,
      description: product.description ?? '',
      category: product.category as ProductFormValues['category'],
      imageUrl: product.imageUrl,
    })
    setImageUrl(product.imageUrl)
  }, [product, reset])

  const onSubmit = (values: ProductFormValues) => {
    setServerError(undefined)
    updateProduct.mutate(
      { name: values.name, description: values.description, category: values.category, imageUrl },
      {
        onSuccess: () => {
          setIsDirty(false)
          navigate(exchangeProductPath(productId), { replace: true })
        },
        onError: (err) => setServerError(toApiError(err).message),
      },
    )
  }

  if (isLoading) return (
    <div className="mx-auto max-w-xl space-y-4 animate-[page-enter_0.3s_ease-out]">
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton h-8 w-64 rounded" />
      <div className="skeleton h-48 w-full rounded-2xl" />
      <div className="skeleton h-12 w-full rounded-xl" />
      <div className="skeleton h-24 w-full rounded-xl" />
    </div>
  )

  if (!product) return (
    <Alert variant="error">Product not found.</Alert>
  )

  return (
    <div
      className="mx-auto max-w-xl space-y-6 animate-[page-enter_0.3s_ease-out]"
      onInput={() => setIsDirty(true)}
    >
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(exchangeProductPath(productId))}>
          ← Back to Product
        </Button>
        <h1 className={cn('mt-3 text-2xl font-black tracking-tight', isDark ? 'text-white' : 'text-foreground')}>
          Edit Product
        </h1>
        <p className="text-sm text-muted-foreground">Update product details, image, and category.</p>
      </div>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Image section */}
        <div
          className={cn('overflow-hidden rounded-2xl border p-5', isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface')}
        >
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Product Image
          </p>
          <ProductImageUploader value={imageUrl} onChange={(url) => { setImageUrl(url); setIsDirty(true) }} />
        </div>

        {/* Core details */}
        <div
          className={cn('overflow-hidden rounded-2xl border p-5 space-y-4', isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface')}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Product Details
          </p>
          <Input
            label="Product name"
            placeholder="e.g. NU Laguna Varsity Shirt"
            error={errors.name?.message}
            {...register('name')}
          />
          <Textarea
            label="Description"
            placeholder="Describe the product…"
            rows={4}
            error={errors.description?.message}
            {...register('description')}
          />
          <Select
            label="Category"
            options={categoryOptions}
            error={errors.category?.message}
            {...register('category')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => navigate(exchangeProductPath(productId))}>
            Cancel
          </Button>
          <Button type="submit" isLoading={updateProduct.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
