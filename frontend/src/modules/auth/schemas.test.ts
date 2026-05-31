import { describe, expect, it } from 'vitest'
import { registerSchema, loginSchema } from './schemas'

describe('registerSchema', () => {
  const valid = {
    fullName: 'Juan Dela Cruz',
    email: 'juan@students.nu-laguna.edu.ph',
    password: 'Password1',
  }

  it('accepts a valid NU account', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a non-NU email domain', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'juan@gmail.com' })
    expect(result.success).toBe(false)
  })

  it('rejects a password without an uppercase letter or number', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'password' }).success).toBe(
      false,
    )
  })
})

describe('loginSchema', () => {
  it('requires email and password', () => {
    expect(loginSchema.safeParse({ email: '', password: '' }).success).toBe(false)
  })
})
