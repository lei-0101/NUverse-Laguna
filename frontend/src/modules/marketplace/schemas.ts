import { z } from 'zod'
import type { SelectOption } from '@/shared/components/ui'
import type { ListingCategory, ListingCondition, ListingStatus } from './types'

/** Ordered categories, mirroring the backend `ListingCategory` enum. */
export const LISTING_CATEGORIES: ListingCategory[] = [
  'SCHOOL_SUPPLIES',
  'BOOKS',
  'GADGETS',
  'UNIFORMS',
  'ACCESSORIES',
  'DORM_ESSENTIALS',
  'FOOD',
  'SERVICES',
  'ART_COMMISSIONS',
]

const CATEGORY_LABELS: Record<ListingCategory, string> = {
  SCHOOL_SUPPLIES: 'School Supplies',
  BOOKS: 'Books',
  GADGETS: 'Gadgets',
  UNIFORMS: 'Uniforms',
  ACCESSORIES: 'Accessories',
  DORM_ESSENTIALS: 'Dorm Essentials',
  FOOD: 'Food',
  SERVICES: 'Services',
  ART_COMMISSIONS: 'Art Commissions',
}

export const LISTING_CONDITIONS: ListingCondition[] = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']

const CONDITION_LABELS: Record<ListingCondition, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
}

const STATUS_LABELS: Record<ListingStatus, string> = {
  AVAILABLE: 'Available',
  SOLD: 'Sold',
  REMOVED: 'Removed',
  SUSPENDED: 'Suspended',
}

export const categoryOptions: SelectOption[] = LISTING_CATEGORIES.map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}))

export const conditionOptions: SelectOption[] = LISTING_CONDITIONS.map((value) => ({
  value,
  label: CONDITION_LABELS[value],
}))

export const formatCategory = (c: ListingCategory): string => CATEGORY_LABELS[c]
export const formatCondition = (c: ListingCondition): string => CONDITION_LABELS[c]
export const formatStatus = (s: ListingStatus): string => STATUS_LABELS[s]

/** Formats a peso price for display. */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(price)
}

export const MAX_LISTING_IMAGES = 10

/** Limits mirror the backend `@Size`/`@Digits`/`@DecimalMin` constraints; server stays authoritative. */
export const listingFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(5000, 'Description must be at most 5000 characters'),
  price: z
    .string()
    .trim()
    .min(1, 'Price is required')
    .refine((v) => /^\d{1,8}(\.\d{1,2})?$/.test(v), 'Enter a valid price (up to 2 decimals)')
    .refine((v) => Number(v) >= 0, 'Price must be 0 or greater'),
  category: z.enum(LISTING_CATEGORIES as [ListingCategory, ...ListingCategory[]]),
  condition: z.enum(LISTING_CONDITIONS as [ListingCondition, ...ListingCondition[]]),
})

export type ListingFormValues = z.infer<typeof listingFormSchema>

/** Report reason mirrors `ReportListingRequest` `@Size(max = 500)`. */
export const reportSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Please describe the issue')
    .max(500, 'Reason must be at most 500 characters'),
})

export type ReportFormValues = z.infer<typeof reportSchema>

/** Image upload constraints mirror the backend `FileValidator`. */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

const imageFileSchema = z
  .instanceof(File)
  .refine(
    (file) => (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type),
    'Only JPG, PNG, or WEBP images are allowed',
  )
  .refine((file) => file.size <= MAX_IMAGE_BYTES, 'Image must be 2 MB or smaller')

/** Validates a chosen image file, returning an error message or null. */
export function validateImageFile(file: File): string | null {
  const result = imageFileSchema.safeParse(file)
  return result.success ? null : (result.error.issues[0]?.message ?? 'Invalid image')
}
