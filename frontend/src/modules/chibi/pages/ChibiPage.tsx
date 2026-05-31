import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { chibiApi } from '../services/chibiApi'
import type { ChibiProfile } from '../types'
import { cn } from '@/shared/lib/cn'
import { Confetti } from '@/shared/components/Confetti'
import { useCountUp } from '@/shared/hooks/useCountUp'
import { useThemeStore } from '@/shared/store/themeStore'

// ── Tier system ───────────────────────────────────────────────────────────────

const LEVEL_TIERS = [
  { min: 1,  max: 2,  label: 'Pup',        gradient: 'from-slate-400 to-slate-500',   glow: 'rgba(100,116,139,0.4)',   accent: '#94a3b8' },
  { min: 3,  max: 4,  label: 'Explorer',   gradient: 'from-green-400 to-teal-500',    glow: 'rgba(16,185,129,0.4)',    accent: '#10b981' },
  { min: 5,  max: 6,  label: 'Regular',    gradient: 'from-blue-400 to-cyan-500',     glow: 'rgba(59,130,246,0.4)',    accent: '#3b82f6' },
  { min: 7,  max: 8,  label: 'Enthusiast', gradient: 'from-indigo-400 to-blue-600',   glow: 'rgba(99,102,241,0.4)',    accent: '#6366f1' },
  { min: 9,  max: 10, label: 'Veteran',    gradient: 'from-purple-400 to-pink-500',   glow: 'rgba(168,85,247,0.4)',    accent: '#a855f7' },
  { min: 11, max: 12, label: 'Master',     gradient: 'from-amber-400 to-yellow-500',  glow: 'rgba(245,158,11,0.4)',    accent: '#f59e0b' },
  { min: 13, max: 14, label: 'Legend',     gradient: 'from-orange-400 to-red-500',    glow: 'rgba(249,115,22,0.45)',   accent: '#f97316' },
  { min: 15, max: 16, label: 'Champion',   gradient: 'from-red-400 to-pink-500',      glow: 'rgba(239,68,68,0.4)',     accent: '#ef4444' },
  { min: 17, max: 18, label: 'Elite',      gradient: 'from-blue-500 to-purple-600',   glow: 'rgba(74,110,232,0.45)',   accent: '#4a6ee8' },
  { min: 19, max: 20, label: 'NUverse',    gradient: 'from-amber-400 to-blue-600',    glow: 'rgba(245,179,0,0.5)',     accent: '#f5b300' },
]

function tierFor(level: number) {
  return LEVEL_TIERS.find((t) => level >= t.min && level <= t.max) ?? LEVEL_TIERS[0]
}

const XP_ACTIONS = [
  { action: 'Register an account',       xp: 100, icon: '🐾' },
  { action: 'Complete your profile',     xp: 50,  icon: '📋' },
  { action: 'Upload an avatar',          xp: 30,  icon: '🖼️' },
  { action: 'Post your first listing',   xp: 80,  icon: '🛒' },
  { action: 'Sell an item',              xp: 60,  icon: '💰' },
  { action: 'Reserve merchandise',       xp: 40,  icon: '🏪' },
  { action: 'RSVP to an event',          xp: 30,  icon: '🎉' },
  { action: 'Follow someone',            xp: 20,  icon: '👥' },
  { action: 'Post a lost/found item',    xp: 35,  icon: '🔍' },
  { action: 'Daily login',              xp: '5+', icon: '☀️' },
]

const ACHIEVEMENT_META: Record<string, { label: string; icon: string; desc: string; xp: number }> = {
  LEVEL_5:   { label: 'Campus Regular',     icon: '⭐', desc: 'Reached Level 5',            xp: 250  },
  LEVEL_10:  { label: 'Bulldog Veteran',    icon: '🌟', desc: 'Reached Level 10',           xp: 500  },
  MAX_LEVEL: { label: 'NUverse Legend',     icon: '🏆', desc: 'Reached the max level — 20', xp: 1000 },
}

const ALL_ACHIEVEMENTS = ['LEVEL_5', 'LEVEL_10', 'MAX_LEVEL']

// ── Chibi SVG Avatar ─────────────────────────────────────────────────────────

function ChibiAvatar({ level, tier }: { level: number; tier: ReturnType<typeof tierFor> }) {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Outer orbit ring */}
      <div
        className="absolute rounded-full border border-dashed"
        style={{
          width: 200, height: 200,
          borderColor: `${tier.accent}40`,
          animation: 'ring-spin 18s linear infinite',
        }}
      />

      {/* Inner glow ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: 150, height: 150,
          background: `radial-gradient(circle, ${tier.glow} 0%, transparent 70%)`,
          filter: 'blur(12px)',
          animation: 'glow-breathe 3s ease-in-out infinite',
          '--glow-start': `0 0 30px ${tier.glow}`,
          '--glow-end':   `0 0 60px ${tier.glow}`,
        } as React.CSSProperties}
      />

      {/* Main avatar SVG — gentle float, eye blink, arm wave */}
      <svg
        width="128"
        height="128"
        viewBox="0 0 120 120"
        className="relative z-10"
        style={{ animation: 'chibi-bob 2.8s ease-in-out infinite' }}
      >
        {/* Body */}
        <ellipse cx="60" cy="80" rx="28" ry="22" fill="url(#cv-body)" />
        {/* Head */}
        <circle cx="60" cy="52" r="26" fill="url(#cv-head)" />
        {/* Ears */}
        <ellipse cx="36" cy="36" rx="10" ry="13" fill="url(#cv-ear)" />
        <ellipse cx="84" cy="36" rx="10" ry="13" fill="url(#cv-ear)" />
        <ellipse cx="36" cy="37" rx="6" ry="8" fill="rgba(245,100,80,0.5)" />
        <ellipse cx="84" cy="37" rx="6" ry="8" fill="rgba(245,100,80,0.5)" />
        {/* Eyes — white base, static pupils, blink using the whole eye group */}
        <circle cx="50" cy="48" r="8" fill={isDark ? 'white' : '#f0ece4'} />
        <circle cx="70" cy="48" r="8" fill={isDark ? 'white' : '#f0ece4'} />
        <g style={{ transformOrigin: '50px 49px', animation: 'chibi-blink 4.5s ease-in-out infinite' }}>
          <circle cx="51" cy="49" r="5" fill="#1a1d24" />
          <circle cx="53" cy="47" r="1.5" fill={isDark ? 'white' : '#f0ece4'} />
        </g>
        <g style={{ transformOrigin: '70px 49px', animation: 'chibi-blink 4.5s ease-in-out infinite 0.05s' }}>
          <circle cx="71" cy="49" r="5" fill="#1a1d24" />
          <circle cx="73" cy="47" r="1.5" fill={isDark ? 'white' : '#f0ece4'} />
        </g>
        {/* Snout */}
        <ellipse cx="60" cy="62" rx="12" ry="8" fill="url(#cv-snout)" />
        <ellipse cx="60" cy="58" rx="5" ry="3.5" fill="#2a1a0a" />
        <path d="M52 65 Q60 72 68 65" stroke="#8b4513" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="56" y="66" width="8" height="4" rx="1" fill="white" />
        {/* Collar */}
        <rect x="42" y="73" width="36" height="6" rx="3" fill="url(#cv-collar)" />
        <circle cx="60" cy="76" r="3" fill="#fcd34d" />
        {/* Left arm — gentle wave, pivot at shoulder (33.5, 72) */}
        <g style={{ transformOrigin: '33.5px 72px', animation: 'chibi-wave-auto 8s ease-in-out infinite' }}>
          <rect x="29" y="72" width="9" height="18" rx="4.5" fill="url(#cv-body)" />
        </g>
        {/* Right arm — static */}
        <rect x="82" y="72" width="9" height="18" rx="4.5" fill="url(#cv-body)" />
        {/* Legs */}
        <rect x="46" y="96" width="10" height="14" rx="5" fill="url(#cv-body)" />
        <rect x="64" y="96" width="10" height="14" rx="5" fill="url(#cv-body)" />

        {/* Level badge */}
        <circle cx="93" cy="24" r="15" fill="url(#cv-badge)" />
        <text x="93" y="20" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="system-ui">LVL</text>
        <text x="93" y="33" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="system-ui">{level}</text>

        <defs>
          <linearGradient id="cv-head" x1="34" y1="26" x2="86" y2="78" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f5c58a" />
            <stop offset="100%" stopColor="#e8a460" />
          </linearGradient>
          <linearGradient id="cv-body" x1="32" y1="58" x2="88" y2="102" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f0b870" />
            <stop offset="100%" stopColor="#d4914a" />
          </linearGradient>
          <linearGradient id="cv-ear" x1="26" y1="23" x2="46" y2="49" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e8a460" />
            <stop offset="100%" stopColor="#c97a38" />
          </linearGradient>
          <linearGradient id="cv-snout" x1="48" y1="54" x2="72" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fcd9a8" />
            <stop offset="100%" stopColor="#f0b870" />
          </linearGradient>
          <linearGradient id="cv-collar" x1="42" y1="73" x2="78" y2="79" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1f3a8a" />
            <stop offset="100%" stopColor="#3b5bd9" />
          </linearGradient>
          <linearGradient id="cv-badge" x1="78" y1="9" x2="108" y2="39" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f5b300" />
            <stop offset="100%" stopColor="#e09800" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// ── XP Progress Bar ───────────────────────────────────────────────────────────

function XpProgressBar({ profile, tier }: { profile: ChibiProfile; tier: ReturnType<typeof tierFor> }) {
  const { xp, level, xpForCurrentLevel, xpForNextLevel, xpToNextLevel } = profile
  const isMax = level >= 20
  const progress = isMax ? 100 : Math.round(
    ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100,
  )

  return (
    <div className="w-full">
      {/* Labels */}
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span
            className="text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ color: tier.accent }}
          >
            {isMax ? 'MAX LEVEL' : `Level ${level} → ${level + 1}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {xp.toLocaleString()} XP
          </span>
          {!isMax && (
            <span className="text-[10px] text-muted-foreground">
              {xpToNextLevel.toLocaleString()} to go
            </span>
          )}
        </div>
      </div>

      {/* Bar */}
      <div
        className="relative h-3 overflow-hidden rounded-full"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-1000', tier.gradient)}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
        {/* Shimmer */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.15) 50%, transparent 80%)',
            backgroundSize: '200%',
            animation: 'shimmer 2s ease-in-out infinite',
          }}
        />
      </div>

      <div className="mt-1.5 text-right">
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {isMax ? '100' : progress}%
        </span>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const LEVEL_STORAGE_KEY = 'nuverse_chibi_last_level'

export function ChibiPage() {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const { data: profile, isLoading } = useQuery({
    queryKey: ['chibi', 'me'],
    queryFn:  chibiApi.getMyProfile,
    staleTime: 60_000,
  })
  const [showConfetti, setShowConfetti] = useState(false)
  const checkedRef = useRef(false)

  useEffect(() => {
    if (!profile || checkedRef.current) return
    checkedRef.current = true
    const storedLevel = parseInt(localStorage.getItem(LEVEL_STORAGE_KEY) ?? '0', 10)
    if (storedLevel > 0 && profile.level > storedLevel) setShowConfetti(true)
    localStorage.setItem(LEVEL_STORAGE_KEY, String(profile.level))
  }, [profile])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-6 py-20">
        <div className="skeleton h-40 w-40 rounded-full" />
        <div className="skeleton h-6 w-48 rounded-lg" />
        <div className="skeleton h-3 w-72 rounded-full" />
      </div>
    )
  }

  if (!profile) return null

  const tier           = tierFor(profile.level)
  const animatedXp     = useCountUp(profile.xp)
  const animatedLevel  = useCountUp(profile.level)
  const animatedBadges = useCountUp(profile.achievements.length)

  return (
    <div className="flex flex-col gap-8 animate-[page-enter_0.3s_ease-out]">
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

      {/* ── CHARACTER SCREEN HERO ──────────────────────────────────── */}
      <div
        className="relative -mx-4 -mt-8 overflow-hidden rounded-b-3xl px-6 pt-10 pb-8 sm:-mx-6 sm:px-8"
        style={{
          background: `radial-gradient(ellipse at 30% 30%, ${tier.glow} 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, ${tier.glow}60 0%, transparent 50%), #0a0d14`,
        }}
      >
        {/* Star particles */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: i % 3 === 0 ? '2px' : '1.5px',
                height: i % 3 === 0 ? '2px' : '1.5px',
                left: `${(i * 43 + 7) % 100}%`,
                top:  `${(i * 67 + 11) % 100}%`,
                opacity: 0.5 + (i % 5) * 0.1,
                animation: `twinkle-${(i % 3) + 1} ${3 + (i % 4)}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          {/* Avatar */}
          <ChibiAvatar level={profile.level} tier={tier} />

          {/* Character nameplate */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: tier.accent }}>
              {tier.label}
            </p>
            <h1 className={cn('mt-1 text-3xl font-black tracking-tight sm:text-4xl', isDark ? 'text-white' : 'text-foreground')}>
              {profile.title ?? 'Bulldog'}
            </h1>
            <p className={cn('mt-1 text-sm', isDark ? 'text-white/50' : 'text-muted-foreground')}>
              Level <span className={cn('font-mono font-bold', isDark ? 'text-white' : 'text-foreground')}>{profile.level}</span> · NU Laguna Campus
            </p>
          </div>

          {/* XP Bar */}
          <div className="w-full max-w-sm">
            <XpProgressBar profile={profile} tier={tier} />
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 h-8"
          aria-hidden="true"
          style={{
            background: `linear-gradient(to bottom, transparent, ${isDark ? '#0a0d14' : 'var(--color-bg)'})`,
          }}
        />
      </div>

      {/* ── STATS GRID ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: animatedXp.toLocaleString(), label: 'Total XP',  accent: tier.accent },
          { value: animatedLevel,                label: 'Level',     accent: tier.accent, highlight: true },
          { value: animatedBadges,               label: 'Badges',   accent: '#f5b300' },
        ].map(({ value, label, accent, highlight }) => (
          <div
            key={label}
            className={cn(
              'relative overflow-hidden rounded-2xl border p-4 text-center transition-all hover:-translate-y-0.5',
              isDark ? 'bg-white/[0.03] border-white/8' : 'bg-surface border-border',
            )}
            style={highlight ? {
              boxShadow: `0 0 0 1px ${accent}40, 0 4px 24px ${accent}20`,
            } : undefined}
          >
            {/* Glow spot */}
            {highlight && (
              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{ background: `radial-gradient(ellipse at 50% 100%, ${accent}15 0%, transparent 70%)` }}
              />
            )}
            <p
              className="relative font-mono tabular-nums text-2xl font-black sm:text-3xl"
              style={{ color: highlight ? accent : 'var(--color-foreground)' }}
            >
              {value}
            </p>
            <p className="relative mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── ACHIEVEMENTS TROPHY ROOM ────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-0.5 rounded-full bg-accent" aria-hidden="true" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Achievements
            </p>
          </div>
          <span className={cn(
            'rounded-full border px-2.5 py-0.5 text-[10px] font-bold',
            isDark ? 'border-white/12 text-muted-foreground' : 'border-border text-muted-foreground',
          )}>
            {profile.achievements.length}/{ALL_ACHIEVEMENTS.length} unlocked
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {ALL_ACHIEVEMENTS.map((key) => {
            const meta     = ACHIEVEMENT_META[key]
            const unlocked = profile.achievements.includes(key)

            return (
              <div
                key={key}
                className={cn(
                  'relative overflow-hidden rounded-2xl border p-5 text-center transition-all duration-300',
                  unlocked
                    ? 'hover:-translate-y-1'
                    : isDark
                      ? 'border-white/6 opacity-40 grayscale'
                      : 'border-border opacity-45 grayscale',
                )}
                style={unlocked ? {
                  background: 'linear-gradient(135deg, rgba(245,179,0,0.08) 0%, rgba(74,110,232,0.06) 100%)',
                  borderColor: 'rgba(245,179,0,0.35)',
                  boxShadow: '0 4px 24px rgba(245,179,0,0.12), 0 0 0 1px rgba(245,179,0,0.15)',
                } : undefined}
              >
                {/* Glow behind icon */}
                {unlocked && (
                  <div
                    className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 h-16 w-16 rounded-full blur-2xl"
                    aria-hidden="true"
                    style={{ background: 'radial-gradient(circle, rgba(245,179,0,0.40) 0%, transparent 70%)' }}
                  />
                )}

                {/* Lock overlay */}
                {!unlocked && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      className="text-muted-foreground/40">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                )}

                <div className="relative z-10">
                  <div
                    className="mb-3 text-5xl"
                    style={unlocked ? { filter: 'drop-shadow(0 2px 10px rgba(245,179,0,0.6))' } : undefined}
                  >
                    {meta.icon}
                  </div>
                  <p className="text-sm font-bold text-foreground">{meta.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{meta.desc}</p>
                  {unlocked ? (
                    <div className="mt-3 flex flex-col items-center gap-1">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-[10px] font-black text-accent">
                        ✓ Unlocked
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">+{meta.xp} XP rewarded</span>
                    </div>
                  ) : (
                    <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── HOW TO EARN XP ─────────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <div className="h-3 w-0.5 rounded-full bg-primary" aria-hidden="true" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            How to Earn XP
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {XP_ACTIONS.map((item) => (
            <div
              key={item.action}
              className={cn(
                'group flex items-center justify-between rounded-xl border px-4 py-3 transition-all hover:-translate-y-0.5',
                isDark
                  ? 'border-white/8 bg-white/[0.02] hover:border-accent/30'
                  : 'border-border bg-surface hover:border-accent/30 hover:shadow-sm',
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-base transition-transform group-hover:scale-110"
                  style={{ background: 'rgba(245,179,0,0.10)' }}
                >
                  {item.icon}
                </div>
                <span className="text-sm text-foreground">{item.action}</span>
              </div>
              <span className="font-mono tabular-nums text-sm font-black text-accent">
                +{item.xp} XP
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
