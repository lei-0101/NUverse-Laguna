import { describe, expect, it } from 'vitest'
import {
  MAX_AVATAR_BYTES,
  editProfileSchema,
  formatYearLevel,
  validateAvatarFile,
} from './schemas'

describe('editProfileSchema', () => {
  const valid = {
    fullName: 'Juan Dela Cruz',
    course: 'BS Computer Science',
    yearLevel: 'THIRD' as const,
    bio: 'Campus developer.',
    interests: 'coding, basketball',
  }

  it('accepts a valid profile with empty optional fields', () => {
    expect(editProfileSchema.safeParse(valid).success).toBe(true)
    expect(
      editProfileSchema.safeParse({ ...valid, course: '', yearLevel: '', bio: '', interests: '' })
        .success,
    ).toBe(true)
  })

  it('rejects a full name shorter than 2 characters', () => {
    expect(editProfileSchema.safeParse({ ...valid, fullName: 'J' }).success).toBe(false)
  })

  it('rejects a bio longer than 500 characters', () => {
    expect(editProfileSchema.safeParse({ ...valid, bio: 'x'.repeat(501) }).success).toBe(false)
  })

  it('rejects an unknown year level', () => {
    expect(editProfileSchema.safeParse({ ...valid, yearLevel: 'SEVENTH' }).success).toBe(false)
  })
})

describe('validateAvatarFile', () => {
  function file(type: string, size: number): File {
    const blob = new Blob([new Uint8Array(size)], { type })
    return new File([blob], 'avatar', { type })
  }

  it('accepts a small JPEG/PNG/WEBP', () => {
    expect(validateAvatarFile(file('image/jpeg', 1024))).toBeNull()
    expect(validateAvatarFile(file('image/png', 1024))).toBeNull()
    expect(validateAvatarFile(file('image/webp', 1024))).toBeNull()
  })

  it('rejects a non-image type', () => {
    expect(validateAvatarFile(file('application/pdf', 1024))).toMatch(/JPG, PNG, or WEBP/i)
  })

  it('rejects a file over 2 MB', () => {
    expect(validateAvatarFile(file('image/png', MAX_AVATAR_BYTES + 1))).toMatch(/2 MB/i)
  })
})

describe('formatYearLevel', () => {
  it('maps enum values to readable labels and null to null', () => {
    expect(formatYearLevel('FIRST')).toBe('1st Year')
    expect(formatYearLevel('GRADUATE')).toBe('Graduate')
    expect(formatYearLevel(null)).toBeNull()
  })
})
