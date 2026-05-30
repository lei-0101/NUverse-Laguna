import { z } from 'zod'
import type { SelectOption } from '@/shared/components/ui'
import type { MerchandiseCategory, ReservationStatus } from './types'

export const MERCHANDISE_CATEGORIES: MerchandiseCategory[] = [
  'CLOTHING',
  'ACCESSORIES',
  'STATIONERY',
  'BAGS',
  'EQUIPMENT',
  'OTHER',
]

const CATEGORY_LABELS: Record<MerchandiseCategory, string> = {
  CLOTHING: 'Clothing',
  ACCESSORIES: 'Accessories',
  STATIONERY: 'Stationery',
  BAGS: 'Bags',
  EQUIPMENT: 'Equipment',
  OTHER: 'Other',
}

const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  FULFILLED: 'Fulfilled',
}

export const categoryOptions: SelectOption[] = MERCHANDISE_CATEGORIES.map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}))

export const formatCategory = (c: MerchandiseCategory): string => CATEGORY_LABELS[c]
export const formatReservationStatus = (s: ReservationStatus): string => RESERVATION_STATUS_LABELS[s]

/** Formats a peso price for display. */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(price)
}

/** Returns a human-readable variant label, e.g. "M / Blue" or "Blue" or "M". */
export function formatVariantLabel(size: string | null, color: string | null): string {
  return [size, color].filter(Boolean).join(' / ') || 'Default'
}

/** Mirrors the backend `CreateProductRequest` / `UpdateProductRequest` constraints. */
export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Product name is required')
    .max(200, 'Name must be at most 200 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(5000, 'Description must be at most 5000 characters'),
  imageUrl: z.string().nullable().optional(),
  category: z.enum(MERCHANDISE_CATEGORIES as [MerchandiseCategory, ...MerchandiseCategory[]]),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

/** Mirrors `AddVariantRequest` constraints. */
export const variantFormSchema = z.object({
  size: z
    .string()
    .trim()
    .max(20, 'Size must be at most 20 characters')
    .optional(),
  color: z
    .string()
    .trim()
    .max(50, 'Color must be at most 50 characters')
    .optional(),
  sku: z
    .string()
    .trim()
    .min(1, 'SKU is required')
    .max(100, 'SKU must be at most 100 characters'),
  stock: z
    .string()
    .trim()
    .min(1, 'Stock is required')
    .refine((v) => /^\d+$/.test(v), 'Stock must be a whole number')
    .refine((v) => Number(v) >= 0, 'Stock cannot be negative'),
  price: z
    .string()
    .trim()
    .min(1, 'Price is required')
    .refine((v) => /^\d{1,8}(\.\d{1,2})?$/.test(v), 'Enter a valid price (up to 2 decimals)')
    .refine((v) => Number(v) >= 0, 'Price must be 0 or greater'),
})

export type VariantFormValues = z.infer<typeof variantFormSchema>

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

export function validateImageFile(file: File): string | null {
  const result = imageFileSchema.safeParse(file)
  return result.success ? null : (result.error.issues[0]?.message ?? 'Invalid image')
}

/** Returns milliseconds remaining until the expiry datetime, or 0 if past. */
export function msUntilExpiry(expiresAt: string): number {
  return Math.max(0, new Date(expiresAt).getTime() - Date.now())
}
