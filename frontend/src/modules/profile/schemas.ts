import { z } from 'zod'
import type { SelectOption } from '@/shared/components/ui'
import type { YearLevel } from './types'

/** Ordered year levels, mirroring the backend `YearLevel` enum. */
export const YEAR_LEVELS: YearLevel[] = ['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'GRADUATE']

const YEAR_LEVEL_LABELS: Record<YearLevel, string> = {
  FIRST: '1st Year',
  SECOND: '2nd Year',
  THIRD: '3rd Year',
  FOURTH: '4th Year',
  FIFTH: '5th Year',
  GRADUATE: 'Graduate',
}

export const yearLevelOptions: SelectOption[] = YEAR_LEVELS.map((value) => ({
  value,
  label: YEAR_LEVEL_LABELS[value],
}))

/** Human-readable label for a year level, or null when unset. */
export function formatYearLevel(yearLevel: YearLevel | null): string | null {
  return yearLevel ? YEAR_LEVEL_LABELS[yearLevel] : null
}

/** Limits mirror the backend `@Size` constraints; server stays authoritative. */
export const editProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters'),
  course: z.string().trim().max(100, 'Course must be at most 100 characters'),
  yearLevel: z.union([z.enum(YEAR_LEVELS as [YearLevel, ...YearLevel[]]), z.literal('')]),
  bio: z.string().trim().max(500, 'Bio must be at most 500 characters'),
  interests: z.string().trim().max(255, 'Interests must be at most 255 characters'),
})

export type EditProfileFormValues = z.infer<typeof editProfileSchema>

/** Avatar upload constraints mirror the backend `FileValidator`. */
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const avatarFileSchema = z
  .instanceof(File)
  .refine(
    (file) => (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type),
    'Only JPG, PNG, or WEBP images are allowed',
  )
  .refine((file) => file.size <= MAX_AVATAR_BYTES, 'Image must be 2 MB or smaller')

/** Validates a chosen avatar file, returning an error message or null. */
export function validateAvatarFile(file: File): string | null {
  const result = avatarFileSchema.safeParse(file)
  return result.success ? null : (result.error.issues[0]?.message ?? 'Invalid image')
}
