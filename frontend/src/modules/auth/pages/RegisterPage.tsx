import { Link } from 'react-router-dom'
import { toApiError } from '@/shared/lib/apiClient'
import { paths } from '@/shared/routes/paths'
import { useRegister } from '../hooks/useAuth'
import { RegisterForm } from '../components/RegisterForm'
import type { RegisterFormValues } from '../schemas'
import { useThemeStore } from '@/shared/store/themeStore'

export function RegisterPage() {
  const register = useRegister()
  const isDark   = useThemeStore((s) => s.theme === 'dark')

  if (register.isSuccess) {
    return (
      <div className="text-center">
        {/* Pulsing success ring */}
        <div className="mx-auto mb-8 relative h-24 w-24 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(34,197,94,0.15)', animationDuration: '2.2s' }}
          />
          <div
            className="relative flex h-24 w-24 items-center justify-center rounded-full"
            style={{
              background: isDark ? 'rgba(34,197,94,0.10)' : 'rgba(34,197,94,0.08)',
              border: '1.5px solid rgba(34,197,94,0.35)',
              boxShadow: '0 0 40px rgba(34,197,94,0.18)',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ color: '#22c55e' }}>
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Editorial heading */}
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.38em]"
          style={{ color: isDark ? 'rgba(34,197,94,0.7)' : 'rgba(21,128,61,0.7)' }}>
          — Account Created —
        </p>
        <h1
          className="font-black tracking-tight"
          style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', lineHeight: 1.05, color: isDark ? '#ffffff' : '#0a1540' }}
        >
          Check Your<br />Inbox.
        </h1>

        <div className="mx-auto my-5 h-[2px] w-14 rounded-full"
          style={{ background: 'linear-gradient(90deg, #22c55e, rgba(74,110,232,0.4), transparent)' }} />

        <p className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.68)' : '#3d5080' }}>
          A verification link has been sent to your email.<br />
          Click it to activate your account, then sign in.
        </p>

        <Link
          to={paths.login}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl h-12 text-[15px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 100%)',
            boxShadow: '0 4px 24px rgba(74,110,232,0.35)',
          }}
        >
          Go to Sign In
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Fashion editorial eyebrow */}
      <p
        className="mb-5 text-xs font-black uppercase"
        style={{
          letterSpacing: '0.32em',
          color: isDark ? 'rgba(167,139,250,0.88)' : 'rgba(31,58,138,0.65)',
          animation: 'hero-reveal 0.4s ease-out both',
        }}
      >
        — New Member —
      </p>

      {/* Massive editorial heading — two lines, clear contrast */}
      <h1
        className="font-black tracking-tight"
        style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.2rem)',
          lineHeight: 1.0,
          color: isDark ? '#ffffff' : '#0a1540',
          animation: 'hero-reveal 0.4s ease-out 0.06s both',
        }}
      >
        Join the<br />
        <span style={{ color: isDark ? '#a5bfff' : '#1f3a8a' }}>
          NUverse.
        </span>
      </h1>

      {/* Purple → gold accent rule (different from login's gold) */}
      <div
        className="my-5 h-[2px] w-14 rounded-full"
        style={{
          background: 'linear-gradient(90deg, rgba(167,139,250,0.9), rgba(245,179,0,0.6), transparent)',
          animation: 'hero-reveal 0.4s ease-out 0.12s both',
        }}
        aria-hidden="true"
      />

      {/* Domain badge */}
      <div
        className="mb-6 flex items-start gap-3 rounded-xl border px-4 py-3.5"
        style={{
          background: isDark ? 'rgba(31,58,138,0.14)' : 'rgba(31,58,138,0.06)',
          borderColor: isDark ? 'rgba(74,110,232,0.28)' : 'rgba(31,58,138,0.16)',
          animation: 'hero-reveal 0.4s ease-out 0.18s both',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true"
          style={{ color: isDark ? '#a5bfff' : '#1f3a8a' }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="text-sm leading-relaxed"
          style={{ color: isDark ? 'rgba(165,191,255,0.88)' : 'rgba(31,58,138,0.82)' }}>
          Requires your{' '}
          <strong className="font-bold" style={{ color: isDark ? '#a5bfff' : '#1f3a8a' }}>
            @students.nu-laguna.edu.ph
          </strong>{' '}email.
        </p>
      </div>

      <div style={{ animation: 'hero-reveal 0.4s ease-out 0.24s both' }}>
        <RegisterForm
          onSubmit={(values: RegisterFormValues) => register.mutate(values)}
          isSubmitting={register.isPending}
          serverError={register.isError ? toApiError(register.error).message : undefined}
        />
      </div>
    </div>
  )
}
