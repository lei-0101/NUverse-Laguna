import { describe, it, expect } from 'vitest'
import { eventFormSchema, validateImageFile } from './schemas'

describe('eventFormSchema', () => {
  const valid = {
    title: 'NU Open Day',
    category: 'ACADEMIC' as const,
    location: 'NU Gym',
    startTime: '2026-06-10T09:00',
  }

  it('accepts a valid minimal event form', () => {
    const result = eventFormSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = eventFormSchema.safeParse({ ...valid, title: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issues = result.error.issues.map((i) => i.path.join('.'))
      expect(issues).toContain('title')
    }
  })

  it('rejects title exceeding 200 characters', () => {
    const result = eventFormSchema.safeParse({ ...valid, title: 'A'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('rejects invalid category value', () => {
    const result = eventFormSchema.safeParse({ ...valid, category: 'INVALID' })
    expect(result.success).toBe(false)
  })

  it('rejects empty location', () => {
    const result = eventFormSchema.safeParse({ ...valid, location: '' })
    expect(result.success).toBe(false)
  })

  it('rejects location exceeding 300 characters', () => {
    const result = eventFormSchema.safeParse({ ...valid, location: 'X'.repeat(301) })
    expect(result.success).toBe(false)
  })

  it('rejects empty startTime', () => {
    const result = eventFormSchema.safeParse({ ...valid, startTime: '' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid categories', () => {
    const cats = ['ACADEMIC', 'CULTURAL', 'SPORTS', 'SEMINAR', 'SOCIAL', 'OTHER']
    for (const cat of cats) {
      const result = eventFormSchema.safeParse({ ...valid, category: cat })
      expect(result.success, `category ${cat} should be valid`).toBe(true)
    }
  })
})

describe('validateImageFile', () => {
  const makeFile = (type: string, size: number) =>
    new File(['x'.repeat(size)], 'img.png', { type })

  it('accepts JPG, PNG, WEBP files under 2 MB', () => {
    expect(validateImageFile(makeFile('image/jpeg', 100))).toBeNull()
    expect(validateImageFile(makeFile('image/png', 100))).toBeNull()
    expect(validateImageFile(makeFile('image/webp', 100))).toBeNull()
  })

  it('rejects files larger than 2 MB', () => {
    const big = makeFile('image/png', 2 * 1024 * 1024 + 1)
    expect(validateImageFile(big)).not.toBeNull()
  })

  it('rejects non-image MIME types', () => {
    expect(validateImageFile(makeFile('application/pdf', 100))).not.toBeNull()
    expect(validateImageFile(makeFile('image/gif', 100))).not.toBeNull()
  })
})
