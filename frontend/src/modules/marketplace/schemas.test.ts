import { describe, expect, it } from 'vitest'
import {
  formatPrice,
  listingFormSchema,
  reportSchema,
  validateImageFile,
  MAX_IMAGE_BYTES,
} from './schemas'

function imageFile(type: string, size: number): File {
  return new File([new Blob([new Uint8Array(size)], { type })], 'photo', { type })
}

describe('listingFormSchema', () => {
  const valid = {
    title: 'Graphing Calculator',
    description: 'Barely used, complete with manual.',
    price: '1250.50',
    category: 'GADGETS' as const,
    condition: 'LIKE_NEW' as const,
  }

  it('accepts a valid listing', () => {
    expect(listingFormSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a blank title', () => {
    const result = listingFormSchema.safeParse({ ...valid, title: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a title over 200 characters', () => {
    const result = listingFormSchema.safeParse({ ...valid, title: 'a'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('rejects a price with more than two decimals', () => {
    const result = listingFormSchema.safeParse({ ...valid, price: '10.999' })
    expect(result.success).toBe(false)
  })

  it('rejects a non-numeric price', () => {
    const result = listingFormSchema.safeParse({ ...valid, price: 'free' })
    expect(result.success).toBe(false)
  })

  it('accepts a whole-number price', () => {
    expect(listingFormSchema.safeParse({ ...valid, price: '300' }).success).toBe(true)
  })
})

describe('reportSchema', () => {
  it('requires a reason', () => {
    expect(reportSchema.safeParse({ reason: '' }).success).toBe(false)
  })

  it('rejects a reason over 500 characters', () => {
    expect(reportSchema.safeParse({ reason: 'a'.repeat(501) }).success).toBe(false)
  })
})

describe('validateImageFile', () => {
  it('accepts a small PNG', () => {
    expect(validateImageFile(imageFile('image/png', 1024))).toBeNull()
  })

  it('rejects a non-image type', () => {
    expect(validateImageFile(imageFile('application/pdf', 1024))).toMatch(/JPG, PNG, or WEBP/i)
  })

  it('rejects a file over 2 MB', () => {
    expect(validateImageFile(imageFile('image/png', MAX_IMAGE_BYTES + 1))).toMatch(/2 MB/i)
  })
})

describe('formatPrice', () => {
  it('formats a peso amount with two decimals', () => {
    expect(formatPrice(1250.5)).toMatch(/1,250\.50/)
  })
})
