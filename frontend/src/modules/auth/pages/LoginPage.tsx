import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toApiError } from '@/shared/lib/apiClient'
import { paths } from '@/shared/routes/paths'
import { useLogin } from '../hooks/useAuth'
import { LoginForm } from '../components/LoginForm'
import type { LoginFormValues } from '../schemas'

interface RedirectState {
  from?: { pathname: string }
}

export function LoginPage() {
  const login = useLogin()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo =
    (location.state as RedirectState | null)?.from?.pathname ?? paths.dashboard

  const handleSubmit = (values: LoginFormValues) => {
    login.mutate(values, {
      onSuccess: () => navigate(redirectTo, { replace: true }),
    })
  }

  return (
    <div className="animate-[page-enter_0.4s_ease-out]">
      {/* Heading block */}
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-3 select-none">
          Welcome back
        </p>
        <h1 className="text-[1.875rem] font-extrabold tracking-tight text-foreground leading-tight">
          Sign in to{' '}
          <span
            style={{
              background:
                'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 40%, #a78bfa 75%, #f5b300 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            NUverse
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Your campus universe awaits.
        </p>
      </div>

      <LoginForm
        onSubmit={handleSubmit}
        isSubmitting={login.isPending}
        serverError={login.isError ? toApiError(login.error).message : undefined}
      />

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-border/40 text-center">
        <p className="text-sm text-muted-foreground">
          New to NUverse?{' '}
          <Link
            to={paths.register}
            className="font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Create an account →
          </Link>
        </p>
      </div>
    </div>
  )
}
