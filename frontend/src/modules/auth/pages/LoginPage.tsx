import { useLocation } from 'react-router-dom'
import { toApiError } from '@/shared/lib/apiClient'
import { useLogin } from '../hooks/useAuth'
import { LoginForm } from '../components/LoginForm'
import type { LoginFormValues } from '../schemas'
import { useThemeStore } from '@/shared/store/themeStore'
import { useLoginLoadingStore } from '@/shared/components/LoginLoadingScreen'

interface RedirectState { from?: { pathname: string } }

export function LoginPage() {
  const login      = useLogin()
  const location   = useLocation()
  const isDark     = useThemeStore((s) => s.theme === 'dark')
  const showLoading = useLoginLoadingStore((s) => s.show)

  return (
    <div>
      {/* Fashion editorial eyebrow */}
      <p
        className="mb-5 text-xs font-black uppercase"
        style={{
          letterSpacing: '0.32em',
          color: isDark ? 'rgba(245,179,0,0.82)' : 'rgba(31,58,138,0.65)',
          animation: 'hero-reveal 0.4s ease-out both',
        }}
      >
        — Member Access —
      </p>

      {/* Massive editorial heading — explicit colors for contrast */}
      <h1
        className="font-black tracking-tight"
        style={{
          fontSize: 'clamp(2.6rem, 5.5vw, 3.6rem)',
          lineHeight: 1.0,
          color: isDark ? '#ffffff' : '#0a1540',
          animation: 'hero-reveal 0.4s ease-out 0.06s both',
        }}
      >
        Sign In.
      </h1>

      {/* Gold accent rule — editorial */}
      <div
        className="my-5 h-[2px] w-14 rounded-full"
        style={{
          background: 'linear-gradient(90deg, #f5b300, rgba(74,110,232,0.5), transparent)',
          animation: 'hero-reveal 0.4s ease-out 0.12s both',
        }}
        aria-hidden="true"
      />

      {/* Subtext — readable in both modes */}
      <p
        className="mb-8 text-sm leading-relaxed"
        style={{
          color: isDark ? 'rgba(255,255,255,0.65)' : '#3d5080',
          animation: 'hero-reveal 0.4s ease-out 0.16s both',
        }}
      >
        Access your campus universe.
      </p>

      <div style={{ animation: 'hero-reveal 0.4s ease-out 0.22s both' }}>
        <LoginForm
          onSubmit={(values: LoginFormValues) =>
            login.mutate(values, { onSuccess: () => showLoading() })
          }
          isSubmitting={login.isPending}
          serverError={login.isError ? toApiError(login.error).message : undefined}
        />
      </div>
    </div>
  )
}
