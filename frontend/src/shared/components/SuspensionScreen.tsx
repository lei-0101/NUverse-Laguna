import { useSuspensionStore } from '@/shared/store/suspensionStore'
import { useAuthStore } from '@/shared/store/authStore'
import { useLogout } from '@/modules/auth/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/shared/routes/paths'
import { cn } from '@/shared/lib/cn'

export function SuspensionScreen() {
  const info      = useSuspensionStore((s) => s.info)
  const clear     = useSuspensionStore((s) => s.clearSuspension)
  const isLoggedIn = useAuthStore((s) => s.user !== null)
  const logout    = useLogout()
  const navigate  = useNavigate()

  if (!info) return null

  const until = info.suspendedUntil
    ? new Date(info.suspendedUntil).toLocaleDateString('en-PH', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila',
      })
    : null

  const handleAccept = () => {
    clear()
    if (isLoggedIn) {
      logout.mutate(undefined, {
        onSettled: () => navigate(paths.login, { replace: true }),
      })
    } else {
      navigate(paths.login, { replace: true })
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,7,18,0.97)', backdropFilter: 'blur(24px)' }}
    >
      {/* Card */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border"
        style={{ borderColor: 'rgba(239,68,68,0.25)', background: '#0e0f14' }}
      >
        {/* Red top bar */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)' }} />

        <div className="px-8 py-8">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.3)' }}
            >
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M18 4L33 30H3L18 4z" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" fill="rgba(239,68,68,0.12)" />
                <path d="M18 14v7" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="18" cy="26" r="1.5" fill="#ef4444" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h2 className="mb-2 text-center text-2xl font-black text-white">
            Account Suspended
          </h2>

          {/* Count badge */}
          {info.suspendCount > 0 && (
            <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.3em] text-red-400">
              Offense #{info.suspendCount}
            </p>
          )}

          {/* Suspension period */}
          {until && (
            <div
              className="mb-5 rounded-xl p-4 text-center"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-red-400 mb-1">
                Suspended Until
              </p>
              <p className="text-sm font-bold text-white">{until} (PST)</p>
            </div>
          )}
          {!until && (
            <div
              className="mb-5 rounded-xl p-4 text-center"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <p className="text-sm font-bold text-red-400">Suspension duration is indefinite.</p>
            </div>
          )}

          {/* Reason */}
          {info.reason && (
            <p className="mb-5 text-center text-sm text-white/60">
              <span className="font-semibold text-white/80">Reason: </span>{info.reason}
            </p>
          )}

          {/* Terms notice */}
          <div
            className="mb-6 rounded-xl p-4 text-xs leading-relaxed text-white/50"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            By clicking <span className="font-semibold text-white/70">"I Understand & Accept"</span>, you acknowledge that your account has been suspended due to a violation of NU Laguna's community rules and ethics. You agree to adhere to all platform guidelines, respect fellow students and faculty, and refrain from any malicious, harmful, or inappropriate conduct. Failure to comply may result in permanent removal from the platform.
          </div>

          {/* Accept button */}
          <button
            onClick={handleAccept}
            disabled={logout.isPending}
            className={cn(
              'w-full rounded-2xl py-3.5 text-sm font-black text-white transition-all',
              'disabled:opacity-60 hover:-translate-y-0.5',
            )}
            style={{ background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)', boxShadow: '0 4px 24px rgba(239,68,68,0.35)' }}
          >
            {logout.isPending ? 'Logging out…' : 'I Understand & Accept'}
          </button>
        </div>
      </div>
    </div>
  )
}
