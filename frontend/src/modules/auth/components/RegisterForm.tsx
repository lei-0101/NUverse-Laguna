import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormValues } from '../schemas'
import { Alert, Input } from '@/shared/components/ui'

interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => void
  isSubmitting: boolean
  serverError?: string
}

interface StrengthResult {
  score: number
  label: string
  color: string
}

function getPasswordStrength(password: string): StrengthResult {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (score <= 1) return { score: 1, label: 'Weak',   color: '#ef4444' }
  if (score === 2) return { score: 2, label: 'Fair',   color: '#f59e0b' }
  if (score === 3) return { score: 3, label: 'Good',   color: '#3b82f6' }
  return              { score: 4, label: 'Strong', color: '#22c55e' }
}

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function RegisterForm({
  onSubmit,
  isSubmitting,
  serverError,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  const passwordValue = watch('password') ?? ''
  const strength = getPasswordStrength(passwordValue)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <Input
        label="Full name"
        autoComplete="name"
        placeholder="Maria Santos"
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <Input
        label="NU Laguna email"
        type="email"
        autoComplete="email"
        placeholder="you@national-u.edu.ph"
        error={errors.email?.message}
        {...register('email')}
      />

      {/* Password field + strength meter */}
      <div className="flex flex-col gap-1.5">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          error={errors.password?.message}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
          {...register('password')}
        />

        {/* Password strength indicator */}
        {passwordValue.length > 0 && (
          <div className="flex items-center gap-2.5 px-0.5">
            <div className="flex flex-1 gap-1" role="meter" aria-label={`Password strength: ${strength.label}`}>
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="h-[3px] flex-1 rounded-full transition-all duration-300"
                  style={{
                    background:
                      strength.score >= level ? strength.color : 'var(--color-border)',
                  }}
                />
              ))}
            </div>
            <span
              className="text-[11px] font-semibold tabular-nums min-w-[38px] text-right transition-colors duration-300"
              style={{ color: strength.color }}
            >
              {strength.label}
            </span>
          </div>
        )}

        {!errors.password && !passwordValue && (
          <p className="text-xs text-muted-foreground px-0.5">
            8+ chars with upper, lower, and a number.
          </p>
        )}
      </div>

      {/* Gradient CTA button */}
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="auth-cta-btn mt-1 relative h-11 w-full rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        style={{
          background: 'linear-gradient(135deg, #4a6ee8 0%, #8b5cf6 50%, #c084fc 80%, #f59e0b 100%)',
          boxShadow: isSubmitting ? 'none' : '0 4px 20px rgba(139,92,246,0.28)',
        }}
      >
        <span className={isSubmitting ? 'opacity-0' : 'tracking-wide'}>Create account</span>
        {isSubmitting && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </span>
        )}
      </button>
    </form>
  )
}
