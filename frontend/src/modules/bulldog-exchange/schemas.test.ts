import { describe, expect, it } from 'vitest'
import {
  formatPrice,
  formatVariantLabel,
  msUntilExpiry,
  productFormSchema,
  validateImageFile,
  variantFormSchema,
  MAX_IMAGE_BYTES,
} from './schemas'

function imageFile(type: string, size: number): File {
  return new File([new Blob([new Uint8Array(size)], { type })], 'photo', { type })
}

// ── productFormSchema ─────────────────────────────────────────────────────────

describe('productFormSchema', () => {
  const valid = {
    name: 'NU Laguna Shirt',
    description: 'Official campus shirt.',
    category: 'CLOTHING' as const,
    imageUrl: null,
  }

  it('accepts a valid product', () => {
    expect(productFormSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a blank name', () => {
    expect(productFormSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('rejects a name over 200 characters', () => {
    expect(productFormSchema.safeParse({ ...valid, name: 'a'.repeat(201) }).success).toBe(false)
  })

  it('rejects a blank description', () => {
    expect(productFormSchema.safeParse({ ...valid, description: '' }).success).toBe(false)
  })

  it('rejects an invalid category', () => {
    expect(productFormSchema.safeParse({ ...valid, category: 'INVALID' }).success).toBe(false)
  })
})

// ── variantFormSchema ─────────────────────────────────────────────────────────

describe('variantFormSchema', () => {
  const valid = {
    size: 'M',
    color: 'Blue',
    sku: 'NU-SHIRT-M-BLUE',
    stock: '10',
    price: '299.00',
  }

  it('accepts a valid variant', () => {
    expect(variantFormSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a blank SKU', () => {
    expect(variantFormSchema.safeParse({ ...valid, sku: '' }).success).toBe(false)
  })

  it('rejects negative stock', () => {
    expect(variantFormSchema.safeParse({ ...valid, stock: '-1' }).success).toBe(false)
  })

  it('accepts zero stock', () => {
    expect(variantFormSchema.safeParse({ ...valid, stock: '0' }).success).toBe(true)
  })

  it('rejects a non-numeric stock', () => {
    expect(variantFormSchema.safeParse({ ...valid, stock: 'many' }).success).toBe(false)
  })

  it('rejects fractional stock', () => {
    expect(variantFormSchema.safeParse({ ...valid, stock: '5.5' }).success).toBe(false)
  })

  it('rejects a price with more than two decimal places', () => {
    expect(variantFormSchema.safeParse({ ...valid, price: '10.999' }).success).toBe(false)
  })

  it('rejects a non-numeric price', () => {
    expect(variantFormSchema.safeParse({ ...valid, price: 'free' }).success).toBe(false)
  })

  it('accepts a whole-number price', () => {
    expect(variantFormSchema.safeParse({ ...valid, price: '299' }).success).toBe(true)
  })

  it('treats an empty size as undefined (optional field)', () => {
    const result = variantFormSchema.safeParse({ ...valid, size: '' })
    expect(result.success).toBe(true)
  })
})

// ── validateImageFile ─────────────────────────────────────────────────────────

describe('validateImageFile', () => {
  it('accepts a small PNG', () => {
    expect(validateImageFile(imageFile('image/png', 1024))).toBeNull()
  })

  it('accepts a JPEG', () => {
    expect(validateImageFile(imageFile('image/jpeg', 1024))).toBeNull()
  })

  it('accepts a WEBP', () => {
    expect(validateImageFile(imageFile('image/webp', 1024))).toBeNull()
  })

  it('rejects a non-image type', () => {
    expect(validateImageFile(imageFile('application/pdf', 1024))).toMatch(/JPG, PNG, or WEBP/i)
  })

  it('rejects a file over 2 MB', () => {
    expect(validateImageFile(imageFile('image/png', MAX_IMAGE_BYTES + 1))).toMatch(/2 MB/i)
  })
})

// ── formatPrice ───────────────────────────────────────────────────────────────

describe('formatPrice', () => {
  it('formats a peso amount with two decimal places', () => {
    expect(formatPrice(299)).toMatch(/299\.00/)
  })

  it('formats a price with decimals', () => {
    expect(formatPrice(1250.5)).toMatch(/1,250\.50/)
  })
})

// ── formatVariantLabel ────────────────────────────────────────────────────────

describe('formatVariantLabel', () => {
  it('joins size and color with slash', () => {
    expect(formatVariantLabel('M', 'Blue')).toBe('M / Blue')
  })

  it('returns size alone when color is null', () => {
    expect(formatVariantLabel('XL', null)).toBe('XL')
  })

  it('returns color alone when size is null', () => {
    expect(formatVariantLabel(null, 'Red')).toBe('Red')
  })

  it('returns Default when both are null', () => {
    expect(formatVariantLabel(null, null)).toBe('Default')
  })
})

// ── msUntilExpiry ─────────────────────────────────────────────────────────────

describe('msUntilExpiry', () => {
  it('returns 0 for a past expiry', () => {
    const past = new Date(Date.now() - 10000).toISOString()
    expect(msUntilExpiry(past)).toBe(0)
  })

  it('returns a positive number for a future expiry', () => {
    const future = new Date(Date.now() + 60000).toISOString()
    expect(msUntilExpiry(future)).toBeGreaterThan(0)
  })
})
