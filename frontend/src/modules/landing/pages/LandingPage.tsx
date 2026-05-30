import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NUverseMark } from '@/shared/components/NUverseMark'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { useThemeStore } from '@/shared/store/themeStore'
import { Alert, Input } from '@/shared/components/ui'
import { paths } from '@/shared/routes/paths'
import { useLogin } from '@/modules/auth/hooks/useAuth'
import { loginSchema, type LoginFormValues } from '@/modules/auth/schemas'
import { toApiError } from '@/shared/lib/apiClient'

/* ── Hero inline login ───────────────────────────────────────────── */
function HeroLoginForm() {
  const login    = useLogin()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })
  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values, { onSuccess: () => navigate(paths.dashboard, { replace: true }) })
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {login.isError && <Alert variant="error">{toApiError(login.error).message}</Alert>}
      <Input label="Email" type="email" autoComplete="email" placeholder="you@national-u.edu.ph"
        error={errors.email?.message} {...register('email')} />
      <Input label="Password" type="password" autoComplete="current-password"
        error={errors.password?.message} {...register('password')} />
      <button type="submit" disabled={login.isPending}
        className="relative w-full rounded-xl py-3.5 text-base font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 50%, #7c3aed 100%)', boxShadow: '0 4px 20px rgba(74,110,232,0.4)' }}>
        {login.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
            </svg>Signing in…
          </span>
        ) : 'Sign In →'}
      </button>
    </form>
  )
}

/* ── Decorative backgrounds ──────────────────────────────────────── */
function WireframeShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden dark:block" aria-hidden="true">
      <svg width="120" height="120" viewBox="0 0 120 120" className="absolute"
        style={{ right: '6%', top: '12%', opacity: 0.07, animation: 'wireframe-spin 30s linear infinite' }}>
        <polygon points="60,5 110,32 110,88 60,115 10,88 10,32" stroke="#4a6ee8" strokeWidth="1.5" fill="none" />
        <polygon points="60,20 95,38 95,82 60,100 25,82 25,38" stroke="#a78bfa" strokeWidth="1" fill="none" />
      </svg>
      <svg width="300" height="300" viewBox="0 0 300 300" className="absolute"
        style={{ right: '-4%', bottom: '-5%', opacity: 0.03, animation: 'wireframe-spin 60s linear infinite' }}>
        <circle cx="150" cy="150" r="140" stroke="#4a6ee8" strokeWidth="1" fill="none" strokeDasharray="4 6" />
        <circle cx="150" cy="150" r="110" stroke="#a78bfa" strokeWidth="0.8" fill="none" strokeDasharray="3 8" />
      </svg>
    </div>
  )
}

function AuroraBands() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden dark:block overflow-hidden" aria-hidden="true">
      <div className="absolute w-full"
        style={{ height: '35%', top: '10%', background: 'linear-gradient(90deg,transparent 0%,rgba(74,110,232,0.12) 20%,rgba(147,51,234,0.08) 55%,rgba(74,110,232,0.10) 80%,transparent 100%)', filter: 'blur(32px)', animation: 'aurora-drift 14s ease-in-out infinite' }} />
      <div className="absolute w-full"
        style={{ height: '25%', top: '50%', background: 'linear-gradient(90deg,transparent 0%,rgba(245,179,0,0.06) 30%,rgba(74,110,232,0.08) 65%,transparent 100%)', filter: 'blur(40px)', animation: 'aurora-drift-2 18s ease-in-out infinite' }} />
    </div>
  )
}

/* ── Flying Bulldog (hero entry animation) ───────────────────────── */
function FlyingBulldog() {
  const [visible, setVisible] = useState(true)
  useEffect(() => { const t = setTimeout(() => setVisible(false), 3200); return () => clearTimeout(t) }, [])
  if (!visible) return null
  return (
    <div className="pointer-events-none fixed top-[22%] z-[60]"
      style={{ animation: 'fly-across 3s ease-in-out forwards', left: 0 }} aria-hidden="true">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <ellipse cx="32" cy="42" rx="16" ry="12" fill="#f5c58a" />
        <circle cx="32" cy="26" r="16" fill="#f5c58a" />
        <ellipse cx="18" cy="16" rx="7" ry="9" fill="#e8a460" />
        <ellipse cx="46" cy="16" rx="7" ry="9" fill="#e8a460" />
        <circle cx="26" cy="24" r="5" fill="white" /><circle cx="38" cy="24" r="5" fill="white" />
        <circle cx="27" cy="25" r="3" fill="#1a1d24" /><circle cx="39" cy="25" r="3" fill="#1a1d24" />
        <circle cx="28" cy="24" r="1" fill="white" /><circle cx="40" cy="24" r="1" fill="white" />
        <path d="M26 33 Q32 39 38 33" stroke="#8b4513" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <ellipse cx="32" cy="30" rx="7" ry="5" fill="#fcd9a8"/>
        <ellipse cx="32" cy="27" rx="3" ry="2" fill="#2a1a0a"/>
        <rect x="22" y="38" width="20" height="5" rx="2.5" fill="#1f3a8a"/>
        <text x="32" y="42" textAnchor="middle" fill="#f5b300" fontSize="4" fontWeight="bold">N</text>
        <path d="M16 36 Q8 42 10 52 Q20 46 32 48" fill="#f5b300" opacity="0.9"/>
        <path d="M16 36 Q4 30 2 22" stroke="#f5c58a" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <path d="M48 36 Q60 30 62 22" stroke="#f5c58a" strokeWidth="5" strokeLinecap="round" fill="none"/>
      </svg>
    </div>
  )
}

/* ── Product preview mockups ─────────────────────────────────────── */
function MarketplacePreview({ isDark }: { isDark: boolean }) {
  const bg     = isDark ? 'rgba(19,23,32,0.95)' : 'rgba(255,255,255,0.98)'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)'

  const listings = [
    { emoji: '📚', name: 'Engineering Books Vol.1', price: '₱850',   cond: 'Like New', dot: '#10b981' },
    { emoji: '🖩',  name: 'Casio fx-991CW Calc.',   price: '₱1,200', cond: 'New',      dot: '#10b981' },
    { emoji: '👔',  name: 'BSIT School Uniform (M)', price: '₱350',   cond: 'Good',     dot: '#3b82f6' },
    { emoji: '🧪',  name: 'Chemistry Lab Coat',      price: '₱480',   cond: 'Like New', dot: '#10b981' },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: bg, borderColor: border, boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.5)' : '0 24px 80px rgba(0,0,0,0.12)' }}>
      {/* Chrome */}
      <div className="flex items-center gap-3 border-b px-4 py-2.5" style={{ borderColor: border, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
        <div className="flex gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-red-400/70" /><div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" /><div className="h-2.5 w-2.5 rounded-full bg-green-400/70" /></div>
        <div className="flex-1 rounded-md border px-3 py-1 text-[11px] text-muted-foreground" style={{ borderColor: border }}>nuverse.nu-laguna.edu.ph/marketplace</div>
      </div>
      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: border }}>
        <span className="text-xs font-bold text-foreground">Marketplace</span>
        <div className="flex gap-1">
          {['All', 'Near', 'New'].map((t, i) => (
            <button key={t} className="rounded-lg px-2.5 py-1 text-[10px] font-medium transition-colors"
              style={{ background: i === 0 ? 'rgba(74,110,232,0.12)' : 'transparent', color: i === 0 ? '#4a6ee8' : isDark ? '#99a1b3' : '#5b6472' }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      {/* Search */}
      <div className="border-b px-4 py-2.5" style={{ borderColor: border }}>
        <div className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs text-muted-foreground" style={{ borderColor: border, background: cardBg }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Search 200+ listings…
        </div>
      </div>
      {/* Grid */}
      <div className="grid grid-cols-2 gap-2.5 p-4">
        {listings.map((l) => (
          <div key={l.name} className="group cursor-default rounded-xl border p-2.5 transition-all hover:shadow-md" style={{ borderColor: border, background: cardBg }}>
            <div className="mb-2 flex h-14 items-center justify-center rounded-lg text-3xl" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>{l.emoji}</div>
            <p className="truncate text-[11px] font-semibold text-foreground">{l.name}</p>
            <p className="font-mono text-xs font-bold tabular-nums" style={{ color: '#10b981' }}>{l.price}</p>
            <div className="mt-1 flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: l.dot }} />
              <span className="text-[9px] text-muted-foreground">{l.cond}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EventsPreview({ isDark }: { isDark: boolean }) {
  const bg     = isDark ? 'rgba(19,23,32,0.95)' : 'rgba(255,255,255,0.98)'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)'

  const events = [
    { title: 'Battle of Bands 2026', sub: 'Sat, May 31 · NUL Main Gym · 3PM', going: 142, cap: 200, grad: 'from-purple-500 to-pink-500', badge: 'SPORTS', rsvpd: true  },
    { title: "Dean's Hour Lecture",  sub: 'Mon, Jun 2 · Main Auditorium · 2PM', going: 55,  cap: 150, grad: 'from-blue-500 to-indigo-600', badge: 'SEMINAR', rsvpd: false },
    { title: 'Engineering Sports Fest', sub: 'Fri, Jun 7 · Basketball Court · 8AM', going: 89, cap: 120, grad: 'from-green-500 to-emerald-500', badge: 'SPORTS', rsvpd: false },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: bg, borderColor: border, boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.5)' : '0 24px 80px rgba(0,0,0,0.12)' }}>
      <div className="flex items-center gap-3 border-b px-4 py-2.5" style={{ borderColor: border, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
        <div className="flex gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-red-400/70" /><div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" /><div className="h-2.5 w-2.5 rounded-full bg-green-400/70" /></div>
        <div className="flex-1 rounded-md border px-3 py-1 text-[11px] text-muted-foreground" style={{ borderColor: border }}>nuverse.nu-laguna.edu.ph/events</div>
      </div>
      <div className="border-b px-4 py-3" style={{ borderColor: border }}>
        <span className="text-xs font-bold text-foreground">Campus Events</span>
        <div className="mt-2 flex gap-1.5">
          {['All', 'Sports', 'Academic', 'Cultural'].map((t, i) => (
            <button key={t} className="rounded-lg px-2.5 py-1 text-[10px] font-medium"
              style={{ background: i === 0 ? 'rgba(168,85,247,0.12)' : 'transparent', color: i === 0 ? '#a855f7' : isDark ? '#99a1b3' : '#5b6472' }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2.5 p-4">
        {events.map((e) => (
          <div key={e.title} className="rounded-xl border p-3" style={{ borderColor: border, background: cardBg }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-xs font-bold text-foreground">{e.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{e.sub}</p>
              </div>
              {e.rsvpd ? (
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>✓ RSVP'd</span>
              ) : (
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>{e.badge}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                <div className={`h-full rounded-full bg-gradient-to-r ${e.grad}`} style={{ width: `${(e.going / e.cap) * 100}%` }} />
              </div>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{e.going}/{e.cap}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ExchangePreview({ isDark }: { isDark: boolean }) {
  const bg     = isDark ? 'rgba(19,23,32,0.95)' : 'rgba(255,255,255,0.98)'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)'

  const products = [
    { emoji: '🏈', name: 'NUL Basketball Jersey',    price: '₱1,500', stock: 'In Stock',  col: '#f59e0b' },
    { emoji: '👕', name: 'Engineering Department Polo', price: '₱850',  stock: '3 left',   col: '#f59e0b' },
    { emoji: '🎒', name: 'NUverse Campus Bag',        price: '₱1,200', stock: 'In Stock',  col: '#f59e0b' },
    { emoji: '🧢', name: 'NU Laguna Cap',             price: '₱450',   stock: 'Low stock', col: '#ef4444' },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: bg, borderColor: border, boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.5)' : '0 24px 80px rgba(0,0,0,0.12)' }}>
      <div className="flex items-center gap-3 border-b px-4 py-2.5" style={{ borderColor: border, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
        <div className="flex gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-red-400/70" /><div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" /><div className="h-2.5 w-2.5 rounded-full bg-green-400/70" /></div>
        <div className="flex-1 rounded-md border px-3 py-1 text-[11px] text-muted-foreground" style={{ borderColor: border }}>nuverse.nu-laguna.edu.ph/exchange</div>
      </div>
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: border }}>
        <div className="flex h-6 w-6 items-center justify-center rounded-md text-sm" style={{ background: 'rgba(245,158,11,0.15)' }}>🏪</div>
        <span className="text-xs font-bold text-foreground">Bulldog Exchange</span>
        <span className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#d97706' }}>OFFICIAL STORE</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 p-4">
        {products.map((p) => (
          <div key={p.name} className="rounded-xl border p-2.5" style={{ borderColor: border, background: cardBg }}>
            <div className="mb-2 flex h-14 items-center justify-center rounded-lg text-3xl" style={{ background: 'rgba(245,158,11,0.08)' }}>{p.emoji}</div>
            <p className="truncate text-[10px] font-semibold text-foreground">{p.name}</p>
            <p className="font-mono text-xs font-bold tabular-nums" style={{ color: '#f59e0b' }}>{p.price}</p>
            <span className="text-[9px] font-medium" style={{ color: p.col }}>{p.stock}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChibiPreview({ isDark }: { isDark: boolean }) {
  const bg     = isDark ? 'rgba(19,23,32,0.95)' : 'rgba(255,255,255,0.98)'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const achievements = [
    { emoji: '🏆', name: 'First Listing', desc: 'Posted your first item', locked: false },
    { emoji: '📚', name: 'Bookworm',      desc: 'Bought 3 textbooks',      locked: false },
    { emoji: '🎉', name: 'Campus Star',   desc: 'RSVPd 5 events',          locked: false },
    { emoji: '🔒', name: 'Market King',   desc: 'Sell 10 items',           locked: true  },
    { emoji: '🔒', name: 'Social Bee',    desc: 'Follow 20 students',      locked: true  },
    { emoji: '🔒', name: 'Legend',        desc: 'Reach Level 20',          locked: true  },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: bg, borderColor: border, boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.5)' : '0 24px 80px rgba(0,0,0,0.12)' }}>
      <div className="flex items-center gap-3 border-b px-4 py-2.5" style={{ borderColor: border, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
        <div className="flex gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-red-400/70" /><div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" /><div className="h-2.5 w-2.5 rounded-full bg-green-400/70" /></div>
        <div className="flex-1 rounded-md border px-3 py-1 text-[11px] text-muted-foreground" style={{ borderColor: border }}>nuverse.nu-laguna.edu.ph/chibi</div>
      </div>
      {/* Profile header */}
      <div className="border-b p-4" style={{ borderColor: border, background: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 16px rgba(139,92,246,0.35)' }}>🐾</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">Bianca R.</span>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: 'linear-gradient(90deg,#7c3aed,#4f46e5)' }}>Lv.8</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Campus Explorer</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm font-black tabular-nums" style={{ color: '#a78bfa' }}>2,450</p>
            <p className="text-[10px] text-muted-foreground">XP total</p>
          </div>
        </div>
        {/* XP bar */}
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
            <span>Level 8</span><span>550 XP to Level 9</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
            <div className="h-full rounded-full" style={{ width: '65%', background: 'linear-gradient(90deg,#7c3aed,#a78bfa,#f5b300)' }} />
          </div>
        </div>
      </div>
      {/* Achievements */}
      <div className="p-4">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Achievements</p>
        <div className="grid grid-cols-3 gap-2">
          {achievements.map((a) => (
            <div key={a.name} className="flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center"
              style={{ borderColor: border, background: a.locked ? 'transparent' : (isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)'), opacity: a.locked ? 0.4 : 1 }}>
              <span className="text-xl">{a.emoji}</span>
              <p className="text-[9px] font-bold text-foreground">{a.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Social links ────────────────────────────────────────────────── */
const SocialLinks = () => (
  <div className="flex items-center gap-4">
    <a href="https://www.facebook.com/NULagunaPH/" target="_blank" rel="noopener noreferrer"
       className="text-white/50 transition-all duration-200 hover:text-white hover:scale-110" aria-label="Facebook">
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H8v-2.88h2.44V9.8c0-2.41 1.44-3.74 3.63-3.74 1.05 0 2.15.19 2.15.19v2.36h-1.21c-1.19 0-1.56.74-1.56 1.5v1.79H16.3l-.42 2.88h-2.27v6.99A10 10 0 0 0 22 12z"/></svg>
    </a>
    <a href="https://www.instagram.com/nulagunaph/" target="_blank" rel="noopener noreferrer"
       className="text-white/50 transition-all duration-200 hover:text-white hover:scale-110" aria-label="Instagram">
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
    </a>
    <a href="https://x.com/NULagunaPH" target="_blank" rel="noopener noreferrer"
       className="text-white/50 transition-all duration-200 hover:text-white hover:scale-110" aria-label="X">
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    </a>
    <a href="https://www.tiktok.com/@nulagunaph" target="_blank" rel="noopener noreferrer"
       className="text-white/50 transition-all duration-200 hover:text-white hover:scale-110" aria-label="TikTok">
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
    </a>
    <a href="https://www.linkedin.com/company/nulaguna" target="_blank" rel="noopener noreferrer"
       className="text-white/50 transition-all duration-200 hover:text-white hover:scale-110" aria-label="LinkedIn">
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.2 0 22.222 0h.003z"/></svg>
    </a>
  </div>
)

/* ── Main LandingPage ─────────────────────────────────────────────── */
export function LandingPage() {
  const isDark      = useThemeStore((s) => s.theme === 'dark')
  const featureRef  = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setTilt({ x: ((e.clientY - cy) / (rect.height / 2)) * 4, y: -((e.clientX - cx) / (rect.width / 2)) * 4 })
  }

  useEffect(() => {
    const el = featureRef.current
    if (!el) return
    const cards = el.querySelectorAll<HTMLElement>('[data-reveal]')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const e = entry.target as HTMLElement
          e.style.opacity = '1'
          e.style.transform = 'translateY(0)'
          obs.unobserve(e)
        }
      })
    }, { threshold: 0.1 })
    cards.forEach((card, i) => {
      card.style.opacity = '0'
      card.style.transform = 'translateY(40px)'
      card.style.transition = `opacity 0.6s ease ${i * 100}ms, transform 0.6s ease ${i * 100}ms`
      obs.observe(card)
    })
    return () => obs.disconnect()
  }, [])

  const STATS = [
    { num: '5',    label: 'Core modules',       sub: 'Marketplace · Events · Exchange · Lost&Found · Chibi' },
    { num: '100%', label: 'NU Laguna students',  sub: '@national-u.edu.ph verified only'                     },
    { num: '0',    label: 'Platform fees',       sub: 'Trade and discover completely free'                   },
    { num: '∞',    label: 'Possibilities',       sub: 'Your campus, your universe'                           },
  ]

  const featureSections = [
    {
      eyebrow:  'Module 01 · Marketplace',
      headline: 'The campus economy,\nreimagined.',
      body:     'Trade directly with verified NU Laguna students in a trusted, campus-exclusive environment. No middlemen, no platform fees — just Bulldogs helping Bulldogs get the gear they need.',
      tags:     ['Verified Sellers', 'Zero Fees', 'Image Listings', 'Condition Ratings', 'Save & Bookmark'],
      align:    'left',
      preview:  <MarketplacePreview isDark={isDark} />,
      accent:   '#10b981',
    },
    {
      eyebrow:  'Module 02 · Campus Events',
      headline: 'Never miss\nwhat matters.',
      body:     'From championship game nights and surprise celebrity lectures to department seminars and cultural festivals — get instant notifications, RSVP in one tap, and arrive ready.',
      tags:     ['Instant Alerts', 'One-Tap RSVP', 'Live Capacity', 'Category Filters', 'My RSVP History'],
      align:    'right',
      preview:  <EventsPreview isDark={isDark} />,
      accent:   '#8b5cf6',
    },
    {
      eyebrow:  'Module 03 · Bulldog Exchange',
      headline: 'Official NU Laguna\nmerchandise.',
      body:     'Reserve official NU Laguna department merchandise directly through NUverse — jerseys, polo shirts, bags, and more. Official inventory, transparent stock levels, 48-hour reservation window.',
      tags:     ['Official Products', '48hr Reservation', 'Variant Selector', 'Live Stock Count', 'My Reservations'],
      align:    'left',
      preview:  <ExchangePreview isDark={isDark} />,
      accent:   '#f59e0b',
    },
    {
      eyebrow:  'Module 04 · Bulldog Companion',
      headline: 'Your campus\nidentity, gamified.',
      body:     'Earn XP from every campus interaction — posting listings, RSVPing to events, helping lost item owners. Level up your Bulldog companion, unlock achievements, and build a profile that reflects who you truly are.',
      tags:     ['XP System', 'Level Badges', 'Achievements', 'Daily Trivia', 'Campus Rep Score'],
      align:    'right',
      preview:  <ChibiPreview isDark={isDark} />,
      accent:   '#7c3aed',
    },
  ]

  return (
    <div className="min-h-svh text-foreground overflow-x-hidden" style={{ background: isDark ? '#0a0d14' : '#f8fafc' }}>

      <FlyingBulldog />
      <div className="stars-wrap" aria-hidden="true">
        <div className="stars-1" /><div className="stars-2" /><div className="stars-3" />
      </div>

      {/* ── Sticky nav ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b"
        style={{
          background: isDark ? 'rgba(10,13,20,0.88)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
        }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <NUverseMark size={44} />
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link to={paths.login} className="hidden rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block">Sign in</Link>
            <Link to={paths.register}
              className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 60%, #7c3aed 100%)', boxShadow: '0 2px 12px rgba(74,110,232,0.35)' }}>
              Join NUverse
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-[96svh] overflow-hidden"
        style={{
          background: isDark
            ? 'transparent'
            : 'linear-gradient(155deg, #c7d7fe 0%, #ddd6fe 22%, #fde68a 50%, #d1fae5 78%, #bfdbfe 100%)',
        }}>
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0 block dark:hidden hero-rays-light" aria-hidden="true" style={{ opacity: 0.85 }} />
        <AuroraBands />
        <WireframeShapes />
        {/* Floating orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {[
            { w: 500, h: 500, l: '3%',  t: '3%',   c: 'rgba(31,58,138,0.22)',   d: '11s'                 },
            { w: 380, h: 380, r: '2%',  t: '16%',  c: 'rgba(245,179,0,0.16)',   d: '14s', rev: true       },
            { w: 300, h: 300, l: '46%', b: '12%',  c: 'rgba(167,139,250,0.18)', d: '9s',  del: '1.5s'     },
            { w: 220, h: 220, l: '18%', b: '6%',   c: 'rgba(52,211,153,0.12)',  d: '13s', del: '0.8s'     },
          ].map((o, i) => (
            <div key={i} className="absolute rounded-full blur-3xl"
              style={{ width: o.w, height: o.h, left: o.l, right: (o as any).r, top: o.t, bottom: (o as any).b,
                background: `radial-gradient(circle, ${o.c} 0%, transparent 70%)`,
                animation: `float-orb ${o.d} ease-in-out infinite${(o as any).rev ? ' reverse' : ''}${(o as any).del ? ` ${(o as any).del}` : ''}` }} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 dot-grid dark:hidden" aria-hidden="true" style={{ opacity: 0.25 }} />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:py-24">

          {/* LEFT */}
          <div style={{ animation: 'page-enter 0.7s ease-out both' }}>
            {/* Institutional badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em]"
              style={{ background: isDark ? 'rgba(74,110,232,0.12)' : 'rgba(31,58,138,0.07)', borderColor: isDark ? 'rgba(74,110,232,0.3)' : 'rgba(31,58,138,0.2)', color: isDark ? '#a5b4fc' : '#1f3a8a' }}>
              <span style={{ animation: 'sparkle-pop 2s ease-in-out infinite' }}>✦</span>
              Official Campus Platform · NU Laguna
            </div>

            <h1 className="mb-6 text-5xl font-extrabold tracking-tighter leading-[1.05] sm:text-6xl lg:text-7xl">
              <span className="block text-foreground">Your Campus.</span>
              <span className="block" style={{ background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 30%, #a78bfa 60%, #f5b300 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 2px 8px rgba(74,110,232,0.3))' }}>
                Your Universe.
              </span>
            </h1>

            <p className="mb-8 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Every corner of NU Laguna life, beautifully connected. The official campus platform
              where students buy, sell, discover events, grab merch, and grow their campus
              presence — all in one place, completely free.
            </p>

            {/* Stats row */}
            <div className="mb-8 flex flex-wrap gap-6 border-y py-5"
              style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
              {[
                { n: '5',    l: 'Core modules'   },
                { n: '100%', l: 'Verified users'  },
                { n: '₱0',   l: 'Platform fees'   },
                { n: '∞',    l: 'Campus life'      },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-mono text-2xl font-black tabular-nums text-foreground">{s.n}</div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to={paths.register}
                className="rounded-xl px-7 py-3.5 text-base font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl active:scale-95"
                style={{ background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 50%, #7c3aed 100%)', boxShadow: '0 4px 24px rgba(74,110,232,0.42)' }}>
                Join NUverse — Free ✦
              </Link>
              <a href="#features"
                className="rounded-xl border px-7 py-3.5 text-base font-semibold transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95"
                style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)', borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)', backdropFilter: 'blur(12px)', color: 'var(--color-foreground)' }}>
                See the Platform ↓
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Exclusive to <span className="font-semibold text-foreground/70">@national-u.edu.ph</span> email addresses
            </p>
          </div>

          {/* RIGHT — login card */}
          <div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            style={{ animation: 'page-enter 0.7s ease-out 0.2s both', transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: 'transform 0.25s ease' }}>
            <div className="rounded-2xl border p-7 sm:p-8"
              style={{
                background: isDark ? 'rgba(19,23,32,0.88)' : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(28px)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.09)',
                boxShadow: isDark ? '0 12px 56px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)' : '0 12px 56px rgba(31,58,138,0.14), inset 0 1px 0 rgba(255,255,255,0.95)',
              }}>
              {/* Header */}
              <div className="mb-5 flex items-center gap-3">
                <NUverseMark size={36} showWordmark={false} />
                <div>
                  <h2 className="text-xl font-bold text-foreground">Sign in to NUverse</h2>
                  <p className="text-xs text-muted-foreground">Welcome back, Bulldog 🐾</p>
                </div>
              </div>
              <div className="mb-5 h-px w-full rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(74,110,232,0.45), rgba(245,179,0,0.35), transparent)' }} />
              <HeroLoginForm />
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 border-t border-border/50" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 border-t border-border/50" />
              </div>
              <Link to={paths.register}
                className="block w-full rounded-xl border border-border/60 py-3 text-center text-sm font-semibold text-foreground/80 transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
                Create Account — It's Free →
              </Link>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Requires <span className="font-medium">@national-u.edu.ph</span> email
              </p>
            </div>
          </div>

        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground/50" style={{ animation: 'idle-bob 2.5s ease-in-out infinite' }} aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
        </div>
      </section>

      {/* ── MODULE STRIP ──────────────────────────────────────── */}
      <div className="relative z-10 border-y"
        style={{
          borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
          background:  isDark ? 'rgba(13,17,28,0.7)'     : 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(12px)',
        }}>
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 sm:gap-x-1">
            {[
              { icon: '🛒', label: 'Marketplace'       },
              { icon: '🎉', label: 'Campus Events'      },
              { icon: '🏪', label: 'Bulldog Exchange'   },
              { icon: '🔍', label: 'Lost & Found'       },
              { icon: '🐾', label: 'Bulldog Chibi'      },
            ].map((m, i, arr) => (
              <div key={m.label} className="flex items-center">
                <span
                  className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(31,58,138,0.06)',
                    color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(31,58,138,0.75)',
                  }}
                >
                  <span className="text-sm">{m.icon}</span>
                  {m.label}
                </span>
                {i < arr.length - 1 && (
                  <span className="mx-2 text-[10px]"
                    style={{ color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }}>
                    ·
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURE SECTIONS ──────────────────────────────────── */}
      <div id="features" ref={featureRef}>
        {featureSections.map((f, idx) => {
          const isRight = f.align === 'right'
          const isLast  = idx === featureSections.length - 1
          return (
            <section key={f.eyebrow}
              className="relative z-10"
              style={{
                background: isDark
                  ? idx % 2 === 0 ? 'rgba(19,23,32,0.4)' : 'transparent'
                  : idx % 2 === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(249,250,251,0.9)',
                borderBottom: isLast ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              }}>
              <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

                  {/* Text block */}
                  <div className={`${isRight ? 'lg:order-last' : ''}`} data-reveal>
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em]" style={{ color: f.accent }}>
                      {f.eyebrow}
                    </p>
                    <h2 className="mb-5 whitespace-pre-line text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                      {f.headline}
                    </h2>
                    <p className="mb-6 max-w-md text-base leading-relaxed text-muted-foreground">
                      {f.body}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {f.tags.map((tag) => (
                        <span key={tag}
                          className="rounded-full border px-3.5 py-1.5 text-xs font-medium"
                          style={{
                            borderColor: `${f.accent}30`,
                            background: `${f.accent}0a`,
                            color: f.accent,
                          }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Preview mockup */}
                  <div className={`${isRight ? 'lg:order-first' : ''}`} data-reveal>
                    {f.preview}
                  </div>

                </div>
              </div>
            </section>
          )
        })}
      </div>

      {/* ── STATS STRIP ───────────────────────────────────────── */}
      <section className="relative z-10 py-20 border-y"
        style={{
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          background: isDark
            ? 'radial-gradient(ellipse at 50% 50%, rgba(74,110,232,0.08) 0%, transparent 60%), rgba(13,17,28,0.8)'
            : 'radial-gradient(ellipse at 50% 50%, rgba(31,58,138,0.04) 0%, transparent 60%), rgba(255,255,255,0.9)',
        }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="mb-1 font-mono text-4xl font-black tabular-nums text-foreground sm:text-5xl"
                  style={{ background: 'linear-gradient(135deg, #1f3a8a, #4a6ee8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {s.num}
                </div>
                <div className="mb-1 text-sm font-bold text-foreground">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="relative z-10 overflow-hidden py-32">
        {/* Full gradient background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0f1f5c 0%, #1f3a8a 25%, #4a6ee8 55%, #7c3aed 80%, #1f3a8a 100%)', backgroundSize: '200% 200%', animation: 'gradient-shift 8s ease infinite' }} aria-hidden="true" />
        {/* Stars overlay in dark mode */}
        <div className="pointer-events-none absolute inset-0 hidden dark:block opacity-30" aria-hidden="true">
          <div className="stars-1" /><div className="stars-2" />
        </div>
        {/* Orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute left-1/4 top-0 h-80 w-80 rounded-full blur-3xl" style={{ background: 'rgba(245,179,0,0.15)' }} />
          <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full blur-3xl" style={{ background: 'rgba(139,92,246,0.2)' }} />
        </div>
        {/* Dot grid overlay */}
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-10" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
          <NUverseMark size={60} showWordmark={false} className="mb-8 justify-center" />
          <h2 className="mb-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Start your<br className="hidden sm:block" /> NUverse journey.
          </h2>
          <p className="mb-10 text-lg text-white/75 max-w-xl mx-auto leading-relaxed">
            Join hundreds of NU Laguna students, faculty, and staff already on the platform.
            Your campus universe awaits.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={paths.register}
              className="rounded-xl px-8 py-4 text-base font-bold text-primary transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl active:scale-95"
              style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
              Create Your Free Account ✦
            </Link>
            <Link to={paths.login}
              className="rounded-xl border border-white/25 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:bg-white/15 hover:shadow-xl active:scale-95">
              Sign In
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/50">
            Exclusive to <span className="font-semibold text-white/75">@national-u.edu.ph</span> email addresses · No payment required
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ background: isDark ? '#070a12' : '#0f1f5c' }}>

        {/* Main footer grid */}
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

            {/* Brand */}
            <div className="lg:col-span-1">
              <NUverseMark size={52} className="mb-5" />
              <p className="mb-6 max-w-xs text-sm leading-relaxed text-white/55">
                The official digital campus hub of National University Laguna — built to make student life more connected, convenient, and memorable.
              </p>
              <SocialLinks />
            </div>

            {/* Platform links */}
            <div>
              <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/35">Platform</h3>
              <ul className="space-y-3">
                {['Marketplace', 'Campus Events', 'Bulldog Exchange', 'Lost & Found', 'Bulldog Chibi', 'Notifications'].map((l) => (
                  <li key={l}>
                    <Link to={paths.login} className="text-sm text-white/55 transition-colors hover:text-white/90">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* University */}
            <div>
              <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/35">University</h3>
              <ul className="space-y-3">
                {[
                  { label: 'NUIS Portal',  href: 'https://onlineapp.nu-laguna.edu.ph/portal/services.php' },
                  { label: 'Admissions',   href: 'https://onlineapp.nu-laguna.edu.ph/quest/home.php'      },
                ].map((l) => (
                  <li key={l.label}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-white/55 transition-colors hover:text-white/90">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/35">Contact</h3>
              <ul className="space-y-4 text-sm text-white/55">
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span>Km 53, Pan Philippine Hwy, Brgy. Milagrosa, Calamba City, Laguna 4027</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="h-4 w-4 shrink-0 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  <span>(02) 712 1900</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="h-4 w-4 shrink-0 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <a href="mailto:admissions@nu-laguna.edu.ph" className="transition-colors hover:text-white/90">admissions@nu-laguna.edu.ph</a>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span>Mon–Fri 8:30AM–5:30PM<br />Saturday 8:30AM–12:30PM</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t px-4 py-5 sm:px-6" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-white/35">© 2026 NUverse Laguna — All Rights Reserved</p>
            <p className="text-xs text-white/35">Powered by Bulldogs ✦</p>
          </div>
        </div>

      </footer>
    </div>
  )
}
