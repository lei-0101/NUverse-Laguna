import { z } from 'zod'

export const EVENT_CATEGORIES = [
  'ACADEMIC', 'CULTURAL', 'SPORTS', 'SEMINAR', 'SOCIAL', 'OTHER',
] as const

export const eventFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string().max(5000, 'Description must not exceed 5000 characters').optional(),
  category: z.enum(
    ['ACADEMIC', 'CULTURAL', 'SPORTS', 'SEMINAR', 'SOCIAL', 'OTHER'] as const,
    { error: 'Category is required' },
  ),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(300, 'Location must not exceed 300 characters'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().optional(),
  coverImageUrl: z.string().max(500).optional(),
  capacityStr: z.string().optional(),
})

export type EventFormValues = z.infer<typeof eventFormSchema>

/** Validates that a file is a valid event cover image (JPG/PNG/WEBP, ≤ 2 MB). */
export function validateImageFile(file: File): string | null {
  const MAX_SIZE = 2 * 1024 * 1024
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
  if (!ALLOWED.includes(file.type)) return 'Only JPG, PNG, or WEBP images are allowed'
  if (file.size > MAX_SIZE) return 'Image must be smaller than 2 MB'
  return null
}
