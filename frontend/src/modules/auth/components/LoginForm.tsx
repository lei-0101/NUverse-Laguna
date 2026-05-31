import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '../schemas'
import { Alert, Input } from '@/shared/components/ui'

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void
  isSubmitting: boolean
  serverError?: string
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

export function LoginForm({ onSubmit, isSubmitting, serverError }: LoginFormProps) {
  const [showPw, setShowPw] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="yourname@students.nu-laguna.edu.ph"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type={showPw ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="Your password"
        error={errors.password?.message}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="p-1 text-muted-foreground transition-colors hover:text-foreground rounded-md"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        }
        {...register('password')}
      />

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="auth-cta-btn relative mt-1 h-12 w-full overflow-hidden rounded-xl text-[15px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        style={{
          background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 55%, #6d55e8 100%)',
          boxShadow: isSubmitting ? 'none' : '0 4px 24px rgba(74,110,232,0.38)',
        }}
      >
        <span className={isSubmitting ? 'opacity-0' : undefined}>Sign in →</span>
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
