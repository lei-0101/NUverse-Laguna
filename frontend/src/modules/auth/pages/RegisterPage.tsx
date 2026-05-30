import { Link } from 'react-router-dom'
import { toApiError } from '@/shared/lib/apiClient'
import { paths } from '@/shared/routes/paths'
import { useRegister } from '../hooks/useAuth'
import { RegisterForm } from '../components/RegisterForm'
import type { RegisterFormValues } from '../schemas'

export function RegisterPage() {
  const register = useRegister()

  const handleSubmit = (values: RegisterFormValues) => {
    register.mutate(values)
  }

  if (register.isSuccess) {
    return (
      <div className="animate-[page-enter_0.4s_ease-out] text-center">
        {/* Success icon with ring glow */}
        <div className="mx-auto mb-6 relative w-20 h-20 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full opacity-30 animate-ping"
            style={{ background: 'rgba(31,149,84,0.5)', animationDuration: '2s' }}
          />
          <div
            className="relative flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              background:
                'linear-gradient(135deg, rgba(31,146,84,0.18) 0%, rgba(47,181,116,0.22) 100%)',
              boxShadow: '0 0 0 1px rgba(31,146,84,0.3), 0 8px 32px rgba(31,146,84,0.15)',
            }}
          >
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              style={{ color: '#2fb574' }}
            >
              <path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Check your inbox
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          We&apos;ve sent a verification link to your email. Click it to activate your account,
          then sign in.
        </p>

        <Link
          to={paths.login}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl h-11 text-sm font-semibold text-white transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          style={{
            background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 100%)',
            boxShadow: '0 4px 24px rgba(74,110,232,0.28)',
          }}
        >
          Go to sign in
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12h14M12 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-[page-enter_0.4s_ease-out]">
      {/* Heading block */}
      <div className="mb-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-3 select-none">
          NU Laguna Community
        </p>
        <h1 className="text-[1.875rem] font-extrabold tracking-tight text-foreground leading-tight">
          Create your{' '}
          <span
            style={{
              background:
                'linear-gradient(135deg, #4a6ee8 0%, #a78bfa 50%, #f5b300 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            account
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Exclusive to NU Laguna students, faculty, and staff.
        </p>
      </div>

      {/* NU email notice */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.07] px-4 py-3">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          className="mt-0.5 shrink-0 text-primary"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 8v4M12 16h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-xs text-primary/85 leading-relaxed">
          Use your official{' '}
          <strong className="font-semibold text-primary">@national-u.edu.ph</strong> email to
          register.
        </p>
      </div>

      <RegisterForm
        onSubmit={handleSubmit}
        isSubmitting={register.isPending}
        serverError={
          register.isError ? toApiError(register.error).message : undefined
        }
      />

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-border/40 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to={paths.login}
            className="font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}
