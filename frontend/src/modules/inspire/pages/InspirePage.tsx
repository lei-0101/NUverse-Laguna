/* eslint-disable react/no-unescaped-entities */
import { useThemeStore } from '@/shared/store/themeStore'
import { cn } from '@/shared/lib/cn'

function formatPrice(n: number) {
  return `₱${n.toLocaleString('en-PH')}`
}

// ── Sports data ───────────────────────────────────────────────────────────────

const SPORTS = [
  { icon: '⚽', name: 'Football',     color: '#16a34a' },
  { icon: '🏐', name: 'Volleyball',   color: '#dc2626' },
  { icon: '🏊', name: 'Swimming',     color: '#2563eb' },
  { icon: '🏀', name: 'Basketball',   color: '#ea580c' },
  { icon: '🏸', name: 'Badminton',    color: '#9333ea' },
  { icon: '⚽', name: 'Futsal',       color: '#16a34a' },
  { icon: '🏓', name: 'Table Tennis', color: '#0284c7' },
  { icon: '🥒', name: 'Pickleball',  color: '#65a30d' },
]

const FACILITIES = [
  {
    name: 'INSPIRE Hoops Center',
    description: 'Full-sized professional basketball courts for training and play.',
    sports: ['Basketball'],
    hours: 'Mon – Sat · 7:00 AM – 9:00 PM',
    emoji: '🏀',
    accent: '#ea580c',
    bgLight: 'rgba(234,88,12,0.06)',
    bgDark: 'rgba(234,88,12,0.08)',
    border: 'rgba(234,88,12,0.25)',
  },
  {
    name: 'INSPIRE Multi-Court Center',
    description: 'World-class multi-purpose courts for 5 sports disciplines under one roof.',
    sports: ['Badminton', 'Futsal', 'Table Tennis', 'Volleyball', 'Pickleball'],
    hours: 'Mon – Sat · 7:00 AM – 9:00 PM',
    emoji: '🏸',
    accent: '#9333ea',
    bgLight: 'rgba(147,51,234,0.06)',
    bgDark: 'rgba(147,51,234,0.08)',
    border: 'rgba(147,51,234,0.25)',
  },
  {
    name: 'INSPIRE Tennis Court',
    description: 'Regulation-size hard courts built for training and competition.',
    sports: ['Tennis'],
    hours: 'Mon – Sat · 7:00 AM – 9:00 PM',
    emoji: '🎾',
    accent: '#16a34a',
    bgLight: 'rgba(22,163,74,0.06)',
    bgDark: 'rgba(22,163,74,0.08)',
    border: 'rgba(22,163,74,0.25)',
  },
  {
    name: 'INSPIRE Football Pitch',
    description: 'Full-size natural grass pitch — ideal for football and futsal training.',
    sports: ['Football', 'Futsal'],
    hours: 'Mon – Sat · 7:00 AM – 6:00 PM',
    emoji: '⚽',
    accent: '#15803d',
    bgLight: 'rgba(21,128,61,0.06)',
    bgDark: 'rgba(21,128,61,0.08)',
    border: 'rgba(21,128,61,0.25)',
  },
  {
    name: 'INSPIRE Aquatic Center',
    description: 'Olympic-standard swimming lanes with trained lifeguards on duty.',
    sports: ['Swimming'],
    hours: 'Mon – Sat · 7:00 AM – 7:00 PM',
    emoji: '🏊',
    accent: '#2563eb',
    bgLight: 'rgba(37,99,235,0.06)',
    bgDark: 'rgba(37,99,235,0.08)',
    border: 'rgba(37,99,235,0.25)',
  },
]

const MEMBERSHIP_PLANS = [
  { label: 'Annual',      price: 30_000, perMonth: 2_500, featured: true  },
  { label: 'Semi-Annual', price: 18_000, perMonth: 3_000, featured: false },
  { label: 'Quarterly',   price: 10_500, perMonth: 3_500, featured: false },
  { label: 'Monthly',     price:  3_500, perMonth: 3_500, featured: false },
]

const GYM_INCLUSIONS = [
  '🏀 Basketball Court', '🏐 Volleyball Court', '🏸 Badminton Court',
  '🎾 Tennis Court', '🏓 Table Tennis', '🥒 Pickleball Court',
  '⚽ Football Pitch', '⚽ Futsal Court', '🏊 Swimming Pool',
]

const TRAINING_PLANS = [
  { sessions: 30, price: 40_000 },
  { sessions: 20, price: 30_000 },
  { sessions: 12, price: 20_000 },
]

const SOCIAL_LINKS = [
  { name: 'Facebook', href: 'https://www.facebook.com/isacademyph/', color: '#1877F2', emoji: '📘' },
  { name: 'Instagram', href: 'https://www.instagram.com/isacademyph', color: '#E1306C', emoji: '📸' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@isacademyph', color: '#000', emoji: '📱' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export function InspirePage() {
  const isDark = useThemeStore((s) => s.theme === 'dark')

  return (
    <div className="flex flex-col gap-8 animate-[page-enter_0.3s_ease-out]">

      {/* ═══════════════════════════════════════════════════════════════
          HERO — Athletic banner with bold identity
          ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative -mx-4 -mt-8 overflow-hidden sm:-mx-6"
        style={{
          background: 'linear-gradient(145deg, #0a0a0a 0%, #111111 40%, #1a1500 100%)',
          minHeight: '340px',
        }}
      >
        {/* Animated glow orbs */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(245,179,0,0.35) 0%, transparent 65%)',
            animation: 'float-orb 6s ease-in-out infinite',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-10 left-1/4 h-56 w-56 rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(245,179,0,0.2) 0%, transparent 65%)',
            animation: 'float-orb 9s ease-in-out infinite reverse',
          }}
          aria-hidden="true"
        />

        {/* Diagonal accent lines (athletic aesthetic) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          aria-hidden="true"
          style={{
            backgroundImage: 'repeating-linear-gradient(60deg, rgba(245,179,0,0.8) 0px, rgba(245,179,0,0.8) 1px, transparent 1px, transparent 32px)',
          }}
        />

        {/* Large watermark */}
        <div
          className="pointer-events-none absolute right-4 bottom-0 select-none font-black leading-none text-white opacity-[0.04]"
          aria-hidden="true"
          style={{ fontSize: 'clamp(80px, 12vw, 160px)' }}
        >
          ISA
        </div>

        <div className="relative z-10 px-6 py-14 sm:px-10 sm:py-16">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.5em] text-amber-400/70">
            NU Laguna Campus
          </p>
          <h1 className="font-black leading-none tracking-tight" style={{ fontSize: 'clamp(3rem, 9vw, 6rem)' }}>
            <span style={{
              background: 'linear-gradient(135deg, #f5b300 0%, #ffd966 50%, #f5b300 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              INSPIRE
            </span>
            <br />
            <span className="text-white/85" style={{ fontSize: '0.55em', letterSpacing: '-0.01em' }}>
              Sports Academy
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/55">
            NU Laguna's premier athletic facility — five world-class venues,
            professional coaching, and a community of champions.
          </p>

          {/* Sport pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {SPORTS.map((s) => (
              <span
                key={s.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm transition-all hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-300"
              >
                <span aria-hidden="true">{s.icon}</span>
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SPORTS CLUB — For NU Students (₱550 / 8 sessions)
          ══════════════════════════════════════════════════════════════ */}
      <section>
        {/* Section label */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-5 w-1 rounded-full bg-amber-500" aria-hidden="true" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
            For NU Laguna Students
          </p>
        </div>

        <div
          className="overflow-hidden rounded-2xl border"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(245,179,0,0.10) 0%, rgba(245,179,0,0.03) 100%)'
              : 'linear-gradient(135deg, rgba(245,179,0,0.12) 0%, rgba(245,179,0,0.04) 100%)',
            borderColor: isDark ? 'rgba(245,179,0,0.25)' : 'rgba(217,119,6,0.22)',
          }}
        >
          <div className="p-6 sm:p-8">
            <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" style={{ animation: 'dot-pulse 2s ease-in-out infinite' }} />
                  INSPIRE Sports Club — Batch 6 · Enrolling Soon
                </div>
                <h2 className={cn('text-2xl font-black leading-tight', isDark ? 'text-white' : 'text-foreground')}>
                  Student Sports Coaching Program
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  NU Laguna students can enroll in coached sessions for{' '}
                  <strong className="text-foreground">Swimming, Basketball, Badminton,</strong> or{' '}
                  <strong className="text-foreground">Volleyball.</strong> Register on-site at the{' '}
                  <strong className="text-foreground">INSPIRE Office, Lower Ground Floor.</strong>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Training schedules announced after enrollment. Follow INSPIRE social pages for updates.
                </p>
              </div>

              <div
                className="flex shrink-0 flex-col items-center justify-center rounded-xl p-5 text-center"
                style={{
                  background: isDark ? 'rgba(245,179,0,0.12)' : 'rgba(245,179,0,0.10)',
                  border: '1px solid rgba(245,179,0,0.30)',
                  minWidth: '150px',
                }}
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">8 sessions for</p>
                <p className="font-mono text-4xl font-black text-foreground mt-1">₱550</p>
                <div className="mt-3 flex flex-col gap-1">
                  {['🏊 Swimming', '🏀 Basketball', '🏸 Badminton', '🏐 Volleyball'].map((s) => (
                    <span key={s} className="text-[11px] font-medium text-muted-foreground">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FACILITIES — Five world-class venues
          ══════════════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-5 w-1 rounded-full bg-blue-500" aria-hidden="true" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
            Facilities
          </p>
        </div>
        <h2 className={cn('mb-6 text-2xl font-black', isDark ? 'text-white' : 'text-foreground')}>
          Five world-class venues
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FACILITIES.map((f) => (
            <div
              key={f.name}
              className="group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{
                background: isDark ? f.bgDark : f.bgLight,
                borderColor: f.border,
              }}
            >
              {/* Sport emoji large background */}
              <div
                className="pointer-events-none absolute -right-3 -top-3 text-[64px] opacity-[0.10]"
                aria-hidden="true"
                style={{ transition: 'transform 0.3s ease', lineHeight: 1 }}
              >
                {f.emoji}
              </div>

              <div className="relative z-10">
                {/* Header */}
                <div className="mb-3 flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{ background: `${f.accent}20` }}
                  >
                    {f.emoji}
                  </div>
                  <div>
                    <h3 className="text-sm font-black leading-tight text-foreground">{f.name}</h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs leading-relaxed text-muted-foreground">{f.description}</p>

                {/* Sport tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {f.sports.map((s) => (
                    <span
                      key={s}
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        background: `${f.accent}15`,
                        color: f.accent,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Hours */}
                <div
                  className="mt-4 flex items-center gap-1.5 border-t pt-3 text-[11px] text-muted-foreground"
                  style={{ borderColor: `${f.accent}18` }}
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <circle cx="8" cy="8" r="7" /><path d="M8 4.5v4l2.5 2.5" />
                  </svg>
                  {f.hours}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ATHLETIC CLUB MEMBERSHIP — Unlimited access + welcome kit
          ══════════════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-5 w-1 rounded-full bg-emerald-500" aria-hidden="true" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
            Athletic Club Membership
          </p>
        </div>
        <h2 className={cn('mb-2 text-2xl font-black', isDark ? 'text-white' : 'text-foreground')}>
          Unlimited access at INSPIRE HPG
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Members get unlimited High-Performance Gym access + 1 free facility hour per visit.
        </p>

        {/* Inclusions */}
        <div className={cn(
          'mb-6 rounded-2xl border p-5',
          isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface',
        )}>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
            What's included
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {GYM_INCLUSIONS.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
            <span className="text-xs font-bold text-muted-foreground">Welcome Kit:</span>
            {['🎒 Gym Bag', '🥤 Tumbler', '🏷️ Towel', '🔐 Digital Locker'].map((item) => (
              <span key={item} className="rounded-full bg-primary/8 px-2.5 py-0.5 text-[11px] font-medium text-primary">{item}</span>
            ))}
          </div>
        </div>

        {/* Pricing grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MEMBERSHIP_PLANS.map((plan) => (
            <div
              key={plan.label}
              className={cn(
                'relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1',
                plan.featured
                  ? isDark ? 'border-amber-500/40 bg-amber-500/5' : 'border-amber-400/40 bg-amber-50/60'
                  : isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface',
              )}
            >
              {plan.featured && (
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
                  style={{ background: 'linear-gradient(90deg, transparent, #f5b300, transparent)' }}
                  aria-hidden="true"
                />
              )}
              {plan.featured && (
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Best Value
                </p>
              )}
              <p className="text-sm font-bold text-muted-foreground">{plan.label}</p>
              <p className="mt-1 font-mono text-3xl font-black text-foreground">
                {formatPrice(plan.price)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                ~{formatPrice(plan.perMonth)}/month
              </p>
            </div>
          ))}
        </div>

        {/* Student discount */}
        <div
          className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border p-4"
          style={{
            background: isDark ? 'rgba(245,179,0,0.06)' : 'rgba(245,179,0,0.05)',
            borderColor: isDark ? 'rgba(245,179,0,0.2)' : 'rgba(217,119,6,0.18)',
          }}
        >
          <div className="text-2xl" aria-hidden="true">🎓</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">NU Laguna Student Discount</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Students receive <strong>20% off</strong> — just{' '}
              <span className="font-mono font-black text-foreground">₱2,800/month</span>{' '}
              instead of ₱3,500.
            </p>
          </div>
          <span
            className="shrink-0 rounded-full px-3 py-1 text-xs font-black text-amber-800 dark:text-amber-300"
            style={{ background: 'rgba(245,179,0,0.25)' }}
          >
            20% OFF
          </span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PERSONAL TRAINING — Coaches + session packs
          ══════════════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-5 w-1 rounded-full bg-red-500" aria-hidden="true" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
            Personal Training
          </p>
        </div>
        <h2 className={cn('mb-2 text-2xl font-black', isDark ? 'text-white' : 'text-foreground')}>
          Train with the best coaches
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          One-on-one sessions with certified athletic trainers. Choose your package.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {TRAINING_PLANS.map((plan, i) => {
            const perSession = Math.round(plan.price / plan.sessions)
            const isTop = i === 0
            return (
              <div
                key={plan.sessions}
                className={cn(
                  'relative overflow-hidden rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1',
                  isTop
                    ? isDark ? 'border-red-500/30 bg-red-500/5' : 'border-red-300/40 bg-red-50/60'
                    : isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface',
                )}
              >
                {isTop && (
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
                    style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }}
                    aria-hidden="true"
                  />
                )}
                <p className="font-mono text-5xl font-black text-foreground">{plan.sessions}</p>
                <p className="text-sm font-medium text-muted-foreground">sessions</p>
                <div className="mt-4">
                  <p className="font-mono text-2xl font-black" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>
                    {formatPrice(plan.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">≈ {formatPrice(perSession)} per session</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CONTACT & SOCIAL — Get in touch
          ══════════════════════════════════════════════════════════════ */}
      <section
        className="rounded-2xl border p-6 sm:p-8"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 0% 50%, rgba(245,179,0,0.06) 0%, transparent 60%), rgba(255,255,255,0.02)'
            : 'radial-gradient(ellipse at 0% 50%, rgba(245,179,0,0.07) 0%, transparent 60%), rgba(245,245,250,0.8)',
          borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
        }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="h-5 w-1 rounded-full bg-amber-500" aria-hidden="true" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
            Contact & Connect
          </p>
        </div>
        <h2 className={cn('mb-6 text-2xl font-black', isDark ? 'text-white' : 'text-foreground')}>
          Visit or reach out to INSPIRE
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Contact details */}
          <div className="space-y-4">
            {[
              { emoji: '📞', label: 'Landline', value: '046 572 3356' },
              { emoji: '📱', label: 'Mobile',   value: '+63 939 986 4897' },
              { emoji: '✉️', label: 'Email',    value: 'ask@inspire-sportsacademy.com', href: 'mailto:ask@inspire-sportsacademy.com' },
              { emoji: '📍', label: 'Location', value: 'Lower Ground Floor, NU Laguna Complex, Calamba City, Laguna' },
            ].map((c) => (
              <div key={c.label} className="flex items-start gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                  style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                >
                  {c.emoji}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="text-sm font-semibold text-primary hover:underline">{c.value}</a>
                  ) : (
                    <p className="text-sm font-semibold text-foreground">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Social + hours */}
          <div className="space-y-5">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                Follow INSPIRE
              </p>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:shadow-sm"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
                    }}
                  >
                    <span>{s.emoji}</span>
                    {s.name}
                  </a>
                ))}
              </div>
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                background: isDark ? 'rgba(245,179,0,0.08)' : 'rgba(245,179,0,0.06)',
                border: '1px solid rgba(245,179,0,0.2)',
              }}
            >
              <p className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2">General Hours</p>
              <p className="text-sm font-semibold text-foreground">Monday – Saturday</p>
              <p className="text-xs text-muted-foreground">7:00 AM – 9:00 PM</p>
              <p className="mt-1 text-xs text-muted-foreground">Closed on Sundays and holidays</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
