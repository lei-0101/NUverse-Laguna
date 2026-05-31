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

function strength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' }
  let s = 0
  if (pw.length >= 8)    s++
  if (/[A-Z]/.test(pw)) s++
  if (/[a-z]/.test(pw)) s++
  if (/\d/.test(pw))    s++
  if (s <= 1) return { score: 1, label: 'Weak',   color: '#ef4444' }
  if (s === 2) return { score: 2, label: 'Fair',   color: '#f59e0b' }
  if (s === 3) return { score: 3, label: 'Good',   color: '#3b82f6' }
  return               { score: 4, label: 'Strong', color: '#22c55e' }
}

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
)
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export function RegisterForm({ onSubmit, isSubmitting, serverError }: RegisterFormProps) {
  const [showPw, setShowPw] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })
  const pw  = watch('password') ?? ''
  const str = strength(pw)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <Input
        label="Full name"
        autoComplete="name"
        placeholder="Your full name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <div>
        <Input
          label="NU Laguna email"
          type="email"
          autoComplete="email"
          placeholder="yourname@students.nu-laguna.edu.ph"
          error={errors.email?.message}
          {...register('email')}
        />
        <p className="mt-1 text-xs text-muted-foreground">Students only — use your @students.nu-laguna.edu.ph email address.</p>
      </div>

      {/* Password + strength */}
      <div className="flex flex-col gap-2">
        <Input
          label="Password"
          type={showPw ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="8+ chars, upper, lower, number"
          error={errors.password?.message}
          endAdornment={
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="p-1 text-muted-foreground transition-colors hover:text-foreground rounded-md"
              aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
          {...register('password')}
        />

        {/* Strength bar */}
        {pw.length > 0 && (
          <div className="flex items-center gap-2.5">
            <div
              className="flex flex-1 gap-1"
              role="meter"
              aria-label={`Password strength: ${str.label}`}
            >
              {[1, 2, 3, 4].map((lvl) => (
                <div
                  key={lvl}
                  className="h-1 flex-1 rounded-full transition-all duration-300"
                  style={{ background: str.score >= lvl ? str.color : 'var(--color-border)' }}
                />
              ))}
            </div>
            <span
              className="min-w-[42px] text-right text-[11px] font-semibold transition-colors duration-300"
              style={{ color: str.color }}
            >
              {str.label}
            </span>
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="auth-cta-btn relative mt-1 h-12 w-full overflow-hidden rounded-xl text-[15px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        style={{
          background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 40%, #8b5cf6 70%, #f59e0b 100%)',
          boxShadow: isSubmitting ? 'none' : '0 4px 24px rgba(139,92,246,0.30)',
        }}
      >
        <span className={isSubmitting ? 'opacity-0' : undefined}>Create account →</span>
        {isSubmitting && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </span>
        )}
      </button>
    </form>
  )
}
