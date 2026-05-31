import { Link, Outlet, useLocation } from 'react-router-dom'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { NUverseMark } from '@/shared/components/NUverseMark'
import { paths } from '@/shared/routes/paths'
import { useThemeStore } from '@/shared/store/themeStore'

const MODULE_TAGS = ['Marketplace', 'Campus Events', 'Bulldog Exchange', 'Lost & Found', 'Bulldog Chibi']

const ORBS = [
  { w: 360, top: '-18%', left: '-20%', color: 'rgba(74,110,232,0.18)',  dur: '16s', del: '0s'   },
  { w: 240, top: '18%',  left: '52%',  color: 'rgba(245,179,0,0.11)',   dur: '20s', del: '4s'   },
  { w: 180, top: '2%',   left: '38%',  color: 'rgba(167,139,250,0.12)', dur: '12s', del: '2s'   },
]

export function AuthLayout() {
  const { pathname } = useLocation()
  const isDark       = useThemeStore((s) => s.theme === 'dark')
  const isRegister   = pathname === paths.register

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">

      {/* Star field */}
      <div className="stars-wrap" aria-hidden="true">
        <div className="stars-1" /><div className="stars-2" /><div className="stars-3" />
      </div>

      {/* ── Left: campus photo — bottom-left content ──── */}
      <aside
        className="auth-panel-bg relative hidden overflow-hidden lg:flex lg:w-[48%] xl:w-[50%] flex-col"
        aria-hidden="true"
      >
        <img
          src="/images/campus.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ animation: 'campus-breathe 28s ease-in-out infinite' }}
        />

        {/* Bottom-heavy overlay: dark at base (text area), clear at top (campus shows) */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'linear-gradient(to top, rgba(4,6,18,0.98) 0%, rgba(4,6,18,0.82) 30%, rgba(4,6,18,0.44) 60%, rgba(4,6,18,0.12) 100%)'
              : 'linear-gradient(to top, rgba(8,18,80,0.97) 0%, rgba(8,18,80,0.80) 30%, rgba(8,18,80,0.36) 62%, rgba(8,18,80,0.08) 100%)',
          }}
        />

        {/* Floating orbs */}
        {ORBS.map((o, i) => (
          <div key={i} className="pointer-events-none absolute rounded-full" style={{
            width: o.w, height: o.w, top: o.top, left: o.left,
            background: o.color, filter: `blur(${o.w * 0.22}px)`,
            animation: `float-orb ${o.dur} ease-in-out infinite ${o.del}`,
          }} />
        ))}

        <div className="absolute inset-0 dot-grid opacity-[0.045] pointer-events-none" />

        {/* Content pinned to bottom-left */}
        <div className="relative z-10 mt-auto px-10 pb-12 xl:px-14">
          <NUverseMark size={50} />

          <div className="mt-8">
            {/* Eyebrow */}
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.38em]"
              style={{ color: 'rgba(245,179,0,0.65)' }}>
              {isRegister ? '— New Member —' : '— Member Access —'}
            </p>
            {/* Heading */}
            <h2
              className="font-black tracking-tight"
              style={{ fontSize: 'clamp(2rem, 2.8vw, 2.6rem)', lineHeight: 1.05, color: '#ffffff' }}
            >
              {isRegister ? 'Join the\n' : 'Welcome to\n'}
              <span style={{
                background: 'linear-gradient(125deg, #ffffff 0%, #cfe0ff 40%, #a5bfff 70%, #f5b300 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                NUverse Laguna
              </span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)' }}>
              {isRegister
                ? 'The official campus hub exclusively for the NU Laguna community.'
                : 'Your campus universe — marketplace, events, merch, and more.'}
            </p>
          </div>

          <div className="my-6 h-px" style={{ background: 'linear-gradient(90deg, rgba(245,179,0,0.5), rgba(74,110,232,0.3), transparent)' }} />

          <div className="flex flex-wrap gap-2">
            {MODULE_TAGS.map((m) => (
              <span key={m}
                className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium backdrop-blur-sm"
                style={{ color: 'rgba(255,255,255,0.55)' }}>
                {m}
              </span>
            ))}
          </div>

          <p className="mt-8 text-[10px] uppercase tracking-[0.22em] select-none"
            style={{ color: 'rgba(255,255,255,0.45)' }}>
            NU Laguna · Calamba, Laguna · Est. 1900
          </p>
        </div>
      </aside>

      {/* ── Right: editorial form panel ───────────────── */}
      <div
        className="relative z-10 flex flex-1 flex-col overflow-hidden"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 20% 10%, rgba(74,110,232,0.18) 0%, transparent 50%), radial-gradient(ellipse at 85% 85%, rgba(245,179,0,0.10) 0%, transparent 50%), radial-gradient(ellipse at 75% 10%, rgba(139,92,246,0.10) 0%, transparent 45%), #07091a'
            : 'radial-gradient(ellipse at 20% 10%, rgba(74,110,232,0.10) 0%, transparent 50%), radial-gradient(ellipse at 85% 85%, rgba(245,179,0,0.07) 0%, transparent 50%), radial-gradient(ellipse at 75% 10%, rgba(139,92,246,0.07) 0%, transparent 45%), #f4f6ff',
          borderLeft: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(31,58,138,0.08)',
        }}
      >
        {/* ── Decorative background graphics ── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">

          {/* NUverse mark — giant watermark, top-right */}
          <div className="absolute -right-16 -top-16" style={{ opacity: isDark ? 0.08 : 0.07 }}>
            <NUverseMark size={380} showWordmark={false} />
          </div>

          {/* Atmospheric orbs — both modes, different colors */}
          <div className="absolute rounded-full" style={{
            width: 300, height: 300, top: '8%', right: '-5%',
            background: isDark
              ? 'radial-gradient(circle, rgba(74,110,232,0.28) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(74,110,232,0.14) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'float-orb 14s ease-in-out infinite',
          }} />
          <div className="absolute rounded-full" style={{
            width: 240, height: 240, bottom: '15%', right: '5%',
            background: isDark
              ? 'radial-gradient(circle, rgba(245,179,0,0.20) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(245,179,0,0.12) 0%, transparent 70%)',
            filter: 'blur(35px)',
            animation: 'float-orb 18s ease-in-out infinite 4s',
          }} />
          <div className="absolute rounded-full" style={{
            width: 200, height: 200, top: '42%', right: '20%',
            background: isDark
              ? 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
            filter: 'blur(30px)',
            animation: 'float-orb 11s ease-in-out infinite 8s',
          }} />
          <div className="absolute rounded-full" style={{
            width: 180, height: 180, bottom: '35%', right: '-2%',
            background: isDark
              ? 'radial-gradient(circle, rgba(20,184,166,0.14) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(31,58,138,0.08) 0%, transparent 70%)',
            filter: 'blur(28px)',
            animation: 'float-orb 22s ease-in-out infinite 2s',
          }} />

          {/* Spinning rings */}
          <div className="absolute right-6 top-[20%] h-[240px] w-[240px] rounded-full" style={{
            border: `1.5px solid ${isDark ? 'rgba(74,110,232,0.22)' : 'rgba(31,58,138,0.18)'}`,
            animation: 'ring-spin 40s linear infinite',
          }} />
          <div className="absolute right-16 top-[28%] h-[150px] w-[150px] rounded-full" style={{
            border: `1.5px solid ${isDark ? 'rgba(245,179,0,0.18)' : 'rgba(245,179,0,0.20)'}`,
            animation: 'ring-spin 26s linear infinite reverse',
          }} />
          <div className="absolute -bottom-14 -left-14 h-[260px] w-[260px] rounded-full" style={{
            border: `1.5px solid ${isDark ? 'rgba(139,92,246,0.14)' : 'rgba(31,58,138,0.12)'}`,
            animation: 'ring-spin 55s linear infinite',
          }} />

          {/* Floating sparkle dots */}
          {[
            { b: '30%', r: '12%', size: 5, color: isDark ? 'rgba(245,179,0,0.80)' : 'rgba(74,110,232,0.45)',   dur: '8s',  del: '0s'   },
            { b: '44%', r: '24%', size: 4, color: isDark ? 'rgba(74,110,232,0.85)' : 'rgba(31,58,138,0.50)',   dur: '11s', del: '3s'   },
            { b: '20%', r: '32%', size: 3, color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(31,58,138,0.35)',  dur: '14s', del: '6s'   },
            { b: '58%', r: '9%',  size: 4, color: isDark ? 'rgba(167,139,250,0.75)' : 'rgba(139,92,246,0.40)', dur: '9s',  del: '1.5s' },
            { b: '68%', r: '20%', size: 3, color: isDark ? 'rgba(245,179,0,0.60)' : 'rgba(245,179,0,0.50)',    dur: '13s', del: '4.5s' },
            { b: '12%', r: '15%', size: 4, color: isDark ? 'rgba(74,110,232,0.70)' : 'rgba(74,110,232,0.45)',  dur: '16s', del: '7s'   },
          ].map((d, i) => (
            <div key={i} className="absolute rounded-full" style={{
              bottom: d.b, right: d.r,
              width: d.size, height: d.size,
              background: d.color,
              boxShadow: `0 0 ${d.size * 5}px ${d.color}`,
              animation: `float-orb ${d.dur} ease-in-out infinite ${d.del}`,
            }} />
          ))}
        </div>

        {/* Mobile header */}
        <header className="flex items-center justify-between px-6 py-4 lg:hidden">
          <Link to={paths.landing}><NUverseMark size={32} /></Link>
          <ThemeToggle />
        </header>

        {/* Desktop controls */}
        <div className="absolute top-5 right-6 z-20 hidden lg:flex items-center gap-3">
          <Link
            to={paths.landing}
            className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
            style={{ color: isDark ? 'rgba(255,255,255,0.62)' : 'rgba(31,58,138,0.65)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Home
          </Link>
          <ThemeToggle />
        </div>

        {/* Form area */}
        <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-[360px]" style={{ animation: 'page-enter 0.45s ease-out both' }}>
            <Outlet />
          </div>
        </main>

        {/* Switch link */}
        <div className="relative z-10 px-6 pb-8 text-center">
          <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.68)' : 'rgba(31,58,138,0.72)' }}>
            {isRegister ? (
              <>Already have an account?{' '}
                <Link to={paths.login}
                  className="font-bold transition-colors hover:opacity-80"
                  style={{ color: isDark ? '#a5bfff' : '#1f3a8a' }}>
                  Sign in
                </Link>
              </>
            ) : (
              <>New to NUverse?{' '}
                <Link to={paths.register}
                  className="font-bold transition-colors hover:opacity-80"
                  style={{ color: isDark ? '#a5bfff' : '#1f3a8a' }}>
                  Create an account
                </Link>
              </>
            )}
          </p>
          <p className="mt-2 text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(31,58,138,0.5)' }}>
            © 2026 NUverse Laguna
          </p>
        </div>
      </div>
    </div>
  )
}
