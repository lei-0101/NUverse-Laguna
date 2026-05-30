import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Input, Select, Textarea } from '@/shared/components/ui'
import {
  categoryOptions,
  conditionOptions,
  listingFormSchema,
  type ListingFormValues,
} from '../schemas'
import type { ListingPayload } from '../types'
import { ListingImageUploader } from './ListingImageUploader'

interface ListingFormProps {
  defaultValues: ListingFormValues
  initialImages: string[]
  submitLabel: string
  onSubmit: (payload: ListingPayload) => void
  isSubmitting: boolean
  serverError?: string
  onCancel?: () => void
}

/** Shared create/edit form. Combines validated text fields with uploaded image URLs. */
export function ListingForm({
  defaultValues,
  initialImages,
  submitLabel,
  onSubmit,
  isSubmitting,
  serverError,
  onCancel,
}: ListingFormProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ListingFormValues>({ resolver: zodResolver(listingFormSchema), defaultValues })

  const submit = (values: ListingFormValues) => {
    onSubmit({
      title: values.title,
      description: values.description,
      price: Number(values.price),
      category: values.category,
      condition: values.condition,
      imageUrls,
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
      {serverError && <Alert variant="error">{serverError}</Alert>}
      <Input label="Title" error={errors.title?.message} {...register('title')} />
      <Textarea
        label="Description"
        rows={5}
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Price (₱)"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          error={errors.price?.message}
          {...register('price')}
        />
        <Select
          label="Category"
          placeholder="Select a category"
          options={categoryOptions}
          error={errors.category?.message}
          {...register('category')}
        />
        <Select
          label="Condition"
          placeholder="Select a condition"
          options={conditionOptions}
          error={errors.condition?.message}
          {...register('condition')}
        />
      </div>
      <div>
        <span className="mb-1.5 block text-sm font-medium text-foreground">Photos</span>
        <ListingImageUploader value={imageUrls} onChange={setImageUrls} />
      </div>
      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
