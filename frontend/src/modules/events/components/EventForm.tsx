import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Input, Select, Textarea } from '@/shared/components/ui'
import { eventFormSchema, validateImageFile, type EventFormValues } from '../schemas'
import { EVENT_CATEGORY_LABELS } from './EventCategoryBadge'
import { useUploadEventImage } from '../hooks/useEvents'
import type { CreateEventData, EventCategory } from '../types'

interface Props {
  defaultValues: EventFormValues
  submitLabel: string
  onSubmit: (data: CreateEventData) => void
  isSubmitting: boolean
  serverError?: string
  onCancel?: () => void
}

/** Shared create / edit form for campus events. */
export function EventForm({ defaultValues, submitLabel, onSubmit, isSubmitting, serverError, onCancel }: Props) {
  const [imageUrl, setImageUrl] = useState<string>(defaultValues.coverImageUrl ?? '')
  const [imageError, setImageError] = useState<string | null>(null)
  const uploadImage = useUploadEventImage()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({ resolver: zodResolver(eventFormSchema), defaultValues })

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) { setImageError(err); return }
    setImageError(null)
    const url = await uploadImage.mutateAsync(file)
    setImageUrl(url)
  }

  const submit = (values: EventFormValues) => {
    const capacity = values.capacityStr ? parseInt(values.capacityStr, 10) : undefined
    onSubmit({
      title: values.title,
      description: values.description,
      category: values.category,
      location: values.location,
      startTime: values.startTime,
      endTime: values.endTime || undefined,
      coverImageUrl: imageUrl || undefined,
      capacity: !isNaN(capacity!) ? capacity : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
          Title <span className="text-danger">*</span>
        </label>
        <Input id="title" {...register('title')} placeholder="Event title" />
        {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground">
          Description
        </label>
        <Textarea id="description" {...register('description')} placeholder="Event details, agenda…" rows={4} />
        {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Select
            id="category"
            label="Category"
            placeholder="Select category"
            options={(Object.entries(EVENT_CATEGORY_LABELS) as [EventCategory, string][]).map(([v, l]) => ({ value: v, label: l }))}
            error={errors.category?.message}
            {...register('category')}
          />
        </div>

        <div>
          <label htmlFor="capacity" className="mb-1.5 block text-sm font-medium text-foreground">
            Capacity <span className="text-xs text-muted-foreground">(leave blank for unlimited)</span>
          </label>
          <Input id="capacity" type="number" min={1} {...register('capacityStr')} placeholder="e.g. 100" />
          {errors.capacityStr && <p className="mt-1 text-xs text-danger">{errors.capacityStr.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-foreground">
          Location <span className="text-danger">*</span>
        </label>
        <Input id="location" {...register('location')} placeholder="e.g. NU Gym, Auditorium" />
        {errors.location && <p className="mt-1 text-xs text-danger">{errors.location.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startTime" className="mb-1.5 block text-sm font-medium text-foreground">
            Start Time <span className="text-danger">*</span>
          </label>
          <Input id="startTime" type="datetime-local" {...register('startTime')} />
          {errors.startTime && <p className="mt-1 text-xs text-danger">{errors.startTime.message}</p>}
        </div>

        <div>
          <label htmlFor="endTime" className="mb-1.5 block text-sm font-medium text-foreground">
            End Time <span className="text-xs text-muted-foreground">(optional)</span>
          </label>
          <Input id="endTime" type="datetime-local" {...register('endTime')} />
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label htmlFor="coverImage" className="mb-1.5 block text-sm font-medium text-foreground">
          Cover Image <span className="text-xs text-muted-foreground">(JPG/PNG/WEBP, ≤ 2 MB)</span>
        </label>
        <div className="flex items-center gap-3">
          {imageUrl && (
            <img src={imageUrl} alt="Cover preview" className="h-20 w-32 rounded-lg object-cover border border-border" />
          )}
          <div>
            <input
              id="coverImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="block text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-border/60"
            />
            {imageError && <p className="mt-1 text-xs text-danger">{imageError}</p>}
            {uploadImage.isPending && <p className="mt-1 text-xs text-muted-foreground">Uploading…</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting || uploadImage.isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
