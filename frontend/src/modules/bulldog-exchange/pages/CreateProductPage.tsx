import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Input, Select, Textarea } from '@/shared/components/ui'
import { toApiError } from '@/shared/lib/apiClient'
import { exchangeProductPath, paths } from '@/shared/routes/paths'
import { categoryOptions, productFormSchema } from '../schemas'
import type { ProductFormValues } from '../schemas'
import { useCreateProduct } from '../hooks/useBulldogExchange'
import { ProductImageUploader } from '../components/ProductImageUploader'
import { useLeaveGuard } from '@/shared/hooks/useLeaveGuard'

/** Admin-only page to create a new merchandise product. */
export function CreateProductPage() {
  const navigate = useNavigate()
  const createProduct = useCreateProduct()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string>()
  const [isDirty, setIsDirty] = useState(false)
  useLeaveGuard(isDirty)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: '', description: '', category: 'CLOTHING', imageUrl: null },
  })

  const onSubmit = (values: ProductFormValues) => {
    setServerError(undefined)
    createProduct.mutate(
      { ...values, imageUrl },
      {
        onSuccess: (product) => {
          setIsDirty(false)
          navigate(exchangeProductPath(product.id), { replace: true })
        },
        onError: (err) => setServerError(toApiError(err).message),
      },
    )
  }

  return (
    <div
      className="mx-auto max-w-xl space-y-6 animate-[page-enter_0.3s_ease-out]"
      onInput={() => setIsDirty(true)}
    >
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(paths.exchange)}>
          ← Back to Exchange
        </Button>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">New product</h1>
        <p className="text-sm text-muted-foreground">Add a new NU merchandise item to the Exchange.</p>
      </div>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Product image</label>
          <ProductImageUploader value={imageUrl} onChange={setImageUrl} />
        </div>

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

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => navigate(paths.exchange)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createProduct.isPending}>
            Create product
          </Button>
        </div>
      </form>
    </div>
  )
}
