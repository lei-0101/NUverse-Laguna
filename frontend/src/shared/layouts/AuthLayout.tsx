import { Link, Outlet, useLocation } from 'react-router-dom'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { NUverseMark } from '@/shared/components/NUverseMark'
import { paths } from '@/shared/routes/paths'

interface PanelContent {
  eyebrow: string
  headline1: string
  headline2: string
  sub: string
  orbs: { color: string; w: number; top: string; left: string; duration: number; delay: number }[]
}

const LOGIN_PANEL: PanelContent = {
  eyebrow: 'NU LAGUNA',
  headline1: 'Your Campus.',
  headline2: 'Your Universe.',
  sub: 'Sign in and step back into your digital campus.',
  orbs: [
    { color: 'rgba(31,58,138,0.42)',  w: 460, top: '-12%', left: '-10%', duration: 13, delay: 0   },
    { color: 'rgba(74,110,232,0.28)', w: 380, top: '32%',  left: '52%',  duration: 17, delay: 2.5 },
    { color: 'rgba(245,179,0,0.22)',  w: 300, top: '62%',  left: '8%',   duration: 11, delay: 5   },
    { color: 'rgba(167,139,250,0.16)',w: 210, top: '14%',  left: '38%',  duration: 9,  delay: 1   },
  ],
}

const REGISTER_PANEL: PanelContent = {
  eyebrow: 'JOIN NU LAGUNA',
  headline1: 'Join the',
  headline2: 'NUverse.',
  sub: 'The exclusive campus hub for students, faculty, and staff.',
  orbs: [
    { color: 'rgba(74,110,232,0.38)',  w: 460, top: '-12%', left: '-10%', duration: 13, delay: 0   },
    { color: 'rgba(167,139,250,0.32)', w: 380, top: '32%',  left: '52%',  duration: 17, delay: 2.5 },
    { color: 'rgba(245,179,0,0.22)',   w: 300, top: '62%',  left: '8%',   duration: 11, delay: 5   },
    { color: 'rgba(236,72,153,0.14)',  w: 210, top: '14%',  left: '38%',  duration: 9,  delay: 1   },
  ],
}

const FEATURES = [
  { icon: '🛒', label: 'Marketplace' },
  { icon: '📅', label: 'Events' },
  { icon: '🎒', label: 'Lost & Found' },
  { icon: '🐾', label: 'Chibi Buddy' },
]

export function AuthLayout() {
  const { pathname } = useLocation()
  const panel = pathname === paths.register ? REGISTER_PANEL : LOGIN_PANEL

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      {/* Global star field — dark mode only */}
      <div className="stars-wrap" aria-hidden="true">
        <div className="stars-1" />
        <div className="stars-2" />
        <div className="stars-3" />
      </div>

      {/* ── Left branding panel ──────────────────────────────── */}
      <aside
        aria-hidden="true"
        className="auth-panel-bg relative hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col items-center justify-center overflow-hidden"
      >
        {/* Subtle dot grid overlay */}
        <div className="absolute inset-0 dot-grid opacity-25 dark:opacity-12" />

        {/* Floating orbs */}
        {panel.orbs.map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              background: orb.color,
              width: orb.w,
              height: orb.w,
              top: orb.top,
              left: orb.left,
              filter: `blur(${Math.round(orb.w * 0.16)}px)`,
              animation: `float-orb ${orb.duration}s ease-in-out infinite ${orb.delay}s`,
            }}
          />
        ))}

        {/* Panel content */}
        <div className="relative z-10 flex flex-col items-center px-12 xl:px-16 text-center max-w-lg">
          <NUverseMark size={88} />

          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 select-none">
            {panel.eyebrow}
          </p>

          <div className="mt-3">
            <p className="text-4xl xl:text-[2.75rem] font-extrabold tracking-tighter leading-[1.05] text-foreground">
              {panel.headline1}
            </p>
            <p
              className="text-4xl xl:text-[2.75rem] font-extrabold tracking-tighter leading-[1.05]"
              style={{
                background:
                  'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 30%, #a78bfa 62%, #f5b300 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {panel.headline2}
            </p>
          </div>

          <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-[22rem]">
            {panel.sub}
          </p>

          {/* Feature pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {FEATURES.map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-surface/25 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
              >
                <span aria-hidden="true">{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom credit */}
        <p className="absolute bottom-5 text-[10px] text-muted-foreground/35 tracking-[0.2em] uppercase select-none">
          NUverse Laguna · NU Laguna
        </p>
      </aside>

      {/* ── Right form panel ─────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 flex-col bg-surface dark:bg-[#0d1117] lg:border-l lg:border-border/50">
        {/* Subtle universe bleed on left edge (desktop) */}
        <div
          className="absolute inset-y-0 left-0 w-20 pointer-events-none hidden lg:block"
          style={{
            background:
              'linear-gradient(to right, rgba(74,110,232,0.05), transparent)',
          }}
        />

        {/* Mobile top bar */}
        <header className="flex items-center justify-between px-5 py-4 lg:hidden">
          <Link to={paths.landing} aria-label="Back to home">
            <NUverseMark size={32} />
          </Link>
          <ThemeToggle />
        </header>

        {/* Desktop theme toggle */}
        <div className="absolute top-4 right-5 z-20 hidden lg:block">
          <ThemeToggle />
        </div>

        {/* Main form content */}
        <main className="flex flex-1 items-center justify-center px-5 py-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
