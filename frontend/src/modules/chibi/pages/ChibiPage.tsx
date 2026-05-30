import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { chibiApi } from '../services/chibiApi'
import type { ChibiProfile } from '../types'
import { cn } from '@/shared/lib/cn'
import { Confetti } from '@/shared/components/Confetti'
import { useCountUp } from '@/shared/hooks/useCountUp'

const LEVEL_TIERS: { min: number; max: number; label: string; color: string; gradient: string }[] = [
  { min: 1,  max: 2,  label: 'Pup',       color: 'text-slate-500',  gradient: 'from-slate-400 to-slate-500' },
  { min: 3,  max: 4,  label: 'Explorer',  color: 'text-green-500',  gradient: 'from-green-400 to-teal-500' },
  { min: 5,  max: 6,  label: 'Regular',   color: 'text-blue-500',   gradient: 'from-blue-400 to-cyan-500' },
  { min: 7,  max: 8,  label: 'Enthusiast',color: 'text-indigo-500', gradient: 'from-indigo-400 to-blue-600' },
  { min: 9,  max: 10, label: 'Veteran',   color: 'text-purple-500', gradient: 'from-purple-400 to-pink-500' },
  { min: 11, max: 12, label: 'Master',    color: 'text-amber-500',  gradient: 'from-amber-400 to-yellow-500' },
  { min: 13, max: 14, label: 'Legend',    color: 'text-orange-500', gradient: 'from-orange-400 to-red-500' },
  { min: 15, max: 16, label: 'Champion',  color: 'text-red-500',    gradient: 'from-red-400 to-pink-500' },
  { min: 17, max: 18, label: 'Elite',     color: 'text-primary',    gradient: 'from-primary to-purple-600' },
  { min: 19, max: 20, label: 'NUverse',   color: 'text-accent',     gradient: 'from-accent to-primary' },
]

function tierFor(level: number) {
  return LEVEL_TIERS.find((t) => level >= t.min && level <= t.max) ?? LEVEL_TIERS[0]
}

const ACHIEVEMENT_META: Record<string, { label: string; icon: string; desc: string }> = {
  LEVEL_5:   { label: 'Level 5',      icon: '⭐', desc: 'Reached Level 5 — Campus Regular' },
  LEVEL_10:  { label: 'Level 10',     icon: '🌟', desc: 'Reached Level 10 — Bulldog Veteran' },
  MAX_LEVEL: { label: 'Max Level',    icon: '🏆', desc: 'Reached Level 20 — NUverse Legend!' },
}

const ALL_ACHIEVEMENTS = ['LEVEL_5', 'LEVEL_10', 'MAX_LEVEL']

function ChibiAvatar({ level }: { level: number }) {
  const tier = tierFor(level)
  return (
    <div className="relative flex items-center justify-center">
      {/* Orbit ring */}
      <div className={cn('absolute h-48 w-48 rounded-full border-2 border-dashed opacity-30', `border-${tier.color.split('-')[1]}-400`)} />
      {/* Glow */}
      <div className={cn('absolute h-36 w-36 rounded-full blur-2xl opacity-20 bg-gradient-to-br', tier.gradient)} />
      {/* Main bulldog SVG */}
      <svg width="120" height="120" viewBox="0 0 120 120" className="relative z-10 animate-[idle-bob_3s_ease-in-out_infinite]">
        {/* Body */}
        <ellipse cx="60" cy="80" rx="28" ry="22" fill="url(#ca-body-grad)" />
        {/* Head */}
        <circle cx="60" cy="52" r="26" fill="url(#ca-head-grad)" />
        {/* Ears */}
        <ellipse cx="36" cy="36" rx="10" ry="13" fill="url(#ca-ear-grad)" />
        <ellipse cx="84" cy="36" rx="10" ry="13" fill="url(#ca-ear-grad)" />
        {/* Inner ear */}
        <ellipse cx="36" cy="37" rx="6" ry="8" fill="rgba(245,100,80,0.5)" />
        <ellipse cx="84" cy="37" rx="6" ry="8" fill="rgba(245,100,80,0.5)" />
        {/* Eyes */}
        <circle cx="50" cy="48" r="8" fill="white" />
        <circle cx="70" cy="48" r="8" fill="white" />
        <circle cx="51" cy="49" r="5" fill="#1a1d24" />
        <circle cx="71" cy="49" r="5" fill="#1a1d24" />
        {/* Eye shine */}
        <circle cx="53" cy="47" r="1.5" fill="white" />
        <circle cx="73" cy="47" r="1.5" fill="white" />
        {/* Snout */}
        <ellipse cx="60" cy="62" rx="12" ry="8" fill="url(#ca-snout-grad)" />
        {/* Nose */}
        <ellipse cx="60" cy="58" rx="5" ry="3.5" fill="#2a1a0a" />
        {/* Smile */}
        <path d="M52 65 Q60 72 68 65" stroke="#8b4513" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Teeth */}
        <rect x="56" y="66" width="8" height="4" rx="1" fill="white" />
        {/* Collar */}
        <rect x="42" y="73" width="36" height="6" rx="3" fill="url(#ca-collar-grad)" />
        <circle cx="60" cy="76" r="3" fill="#fcd34d" />
        {/* Front legs */}
        <rect x="40" y="92" width="10" height="20" rx="5" fill="url(#ca-body-grad)" />
        <rect x="70" y="92" width="10" height="20" rx="5" fill="url(#ca-body-grad)" />
        {/* Tail */}
        <path d="M85 80 Q100 70 95 58" stroke="url(#ca-head-grad)" strokeWidth="8" fill="none" strokeLinecap="round" />

        {/* Level badge */}
        <circle cx="95" cy="25" r="14" fill="url(#ca-badge-grad)" />
        <text x="95" y="21" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="system-ui">LVL</text>
        <text x="95" y="33" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="system-ui">{level}</text>

        <defs>
          <linearGradient id="ca-head-grad" x1="40" y1="26" x2="80" y2="78" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f5c58a" />
            <stop offset="100%" stopColor="#e8a460" />
          </linearGradient>
          <linearGradient id="ca-body-grad" x1="32" y1="58" x2="88" y2="102" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f0b870" />
            <stop offset="100%" stopColor="#d4914a" />
          </linearGradient>
          <linearGradient id="ca-ear-grad" x1="26" y1="23" x2="46" y2="49" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e8a460" />
            <stop offset="100%" stopColor="#c97a38" />
          </linearGradient>
          <linearGradient id="ca-snout-grad" x1="48" y1="54" x2="72" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fcd9a8" />
            <stop offset="100%" stopColor="#f0b870" />
          </linearGradient>
          <linearGradient id="ca-collar-grad" x1="42" y1="73" x2="78" y2="79" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1f3a8a" />
            <stop offset="100%" stopColor="#3b5bd9" />
          </linearGradient>
          <linearGradient id="ca-badge-grad" x1="81" y1="11" x2="109" y2="39" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f5b300" />
            <stop offset="100%" stopColor="#e09800" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function XpBar({ profile }: { profile: ChibiProfile }) {
  const { xp, level, xpForCurrentLevel, xpForNextLevel, xpToNextLevel } = profile
  const isMaxLevel = level >= 20
  const progress = isMaxLevel ? 100 : Math.round(
    ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100
  )
  const tier = tierFor(level)

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono tabular-nums font-bold text-foreground">{xp.toLocaleString()} XP</span>
        {isMaxLevel ? (
          <span className="text-accent font-bold">MAX LEVEL</span>
        ) : (
          <span>{xpToNextLevel.toLocaleString()} XP to Level {level + 1}</span>
        )}
      </div>
      <div className="relative h-4 overflow-hidden rounded-full bg-surface-muted ring-1 ring-border">
        <div
          className={cn('h-full rounded-full transition-all duration-700 bg-gradient-to-r', tier.gradient)}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
        {/* Shimmer effect */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ backgroundSize: '200%', animation: 'shimmer 2s ease-in-out infinite' }}
        />
      </div>
      <div className="mt-1 text-right text-xs text-muted-foreground font-mono tabular-nums">
        {isMaxLevel ? '100' : progress}%
      </div>
    </div>
  )
}

const LEVEL_STORAGE_KEY = 'nuverse_chibi_last_level'

export function ChibiPage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['chibi', 'me'],
    queryFn: chibiApi.getMyProfile,
    staleTime: 60_000,
  })
  const [showConfetti, setShowConfetti] = useState(false)
  const checkedRef = useRef(false)

  useEffect(() => {
    if (!profile || checkedRef.current) return
    checkedRef.current = true
    const storedLevel = parseInt(localStorage.getItem(LEVEL_STORAGE_KEY) ?? '0', 10)
    if (storedLevel > 0 && profile.level > storedLevel) {
      setShowConfetti(true)
    }
    localStorage.setItem(LEVEL_STORAGE_KEY, String(profile.level))
  }, [profile])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-6 py-16">
        <div className="skeleton h-32 w-32 rounded-full" />
        <div className="skeleton h-6 w-48 rounded-lg" />
        <div className="skeleton h-4 w-64 rounded-lg" />
      </div>
    )
  }

  if (!profile) return null

  const tier = tierFor(profile.level)
  const animatedXp    = useCountUp(profile.xp)
  const animatedLevel = useCountUp(profile.level)
  const animatedBadges = useCountUp(profile.achievements.length)

  return (
    <div className="flex flex-col gap-8 animate-[page-enter_0.3s_ease-out]">
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
      {/* Hero — space/game aesthetic */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-[#0a0d14] p-8 text-center">
        {/* Pixel star dots */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-0.5 w-0.5 rounded-full bg-white opacity-60"
              style={{
                left: `${(i * 37 + 11) % 100}%`,
                top: `${(i * 53 + 7) % 100}%`,
                animation: `twinkle-1 ${2 + (i % 4)}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>

        <ChibiAvatar level={profile.level} />

        <h1 className={cn('mt-4 text-3xl font-extrabold tracking-tight', tier.color)}>
          {profile.title ?? tier.label}
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Level <span className="font-mono font-bold text-white">{profile.level}</span> Bulldog
        </p>

        <div className="mx-auto mt-6 max-w-sm">
          <XpBar profile={profile} />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <p className="font-mono tabular-nums text-2xl font-bold text-foreground">{animatedXp.toLocaleString()}</p>
          <p className="mt-0.5 text-xs uppercase tracking-widest text-muted-foreground">Total XP</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{ boxShadow: `0 0 0 1px ${tier.color.includes('accent') ? 'rgba(245,179,0,0.3)' : 'rgba(74,110,232,0.2)'}` }}>
          <p className={cn('font-mono tabular-nums text-2xl font-bold', tier.color)}>{animatedLevel}</p>
          <p className="mt-0.5 text-xs uppercase tracking-widest text-muted-foreground">Level</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <p className="font-mono tabular-nums text-2xl font-bold text-accent">{animatedBadges}</p>
          <p className="mt-0.5 text-xs uppercase tracking-widest text-muted-foreground">Badges</p>
        </div>
      </div>

      {/* How to earn XP */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">How to Earn XP</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { action: 'Register an account', xp: 100, icon: '🐾' },
            { action: 'Complete your profile', xp: 50, icon: '📋' },
            { action: 'Upload an avatar', xp: 30, icon: '🖼️' },
            { action: 'Post your first listing', xp: 80, icon: '🛒' },
            { action: 'Sell an item', xp: 60, icon: '💰' },
            { action: 'Reserve merch', xp: 40, icon: '🏪' },
            { action: 'RSVP to an event', xp: 30, icon: '🎉' },
            { action: 'Follow someone', xp: 20, icon: '👥' },
            { action: 'Post a suggestion', xp: 25, icon: '💡' },
            { action: 'Post a lost/found item', xp: 35, icon: '🔍' },
            { action: 'Daily login', xp: '5+', icon: '☀️' },
          ].map((item) => (
            <div
              key={item.action}
              className="group flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-base"
                  style={{ background: 'rgba(245,179,0,0.10)' }}
                >
                  {item.icon}
                </span>
                <span className="text-sm text-foreground">{item.action}</span>
              </div>
              <span className="font-mono tabular-nums text-sm font-bold text-accent">+{item.xp} XP</span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements — trophy room */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Achievements</h2>
          <span className="text-xs font-medium text-muted-foreground">
            {profile.achievements.length}/{ALL_ACHIEVEMENTS.length} unlocked
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {ALL_ACHIEVEMENTS.map((key) => {
            const meta = ACHIEVEMENT_META[key]
            const unlocked = profile.achievements.includes(key)
            return (
              <div
                key={key}
                className={cn(
                  'relative overflow-hidden rounded-2xl border p-5 text-center transition-all duration-300',
                  unlocked
                    ? 'border-accent/60 hover:-translate-y-1 hover:shadow-xl cursor-default'
                    : 'border-border bg-surface grayscale opacity-45',
                )}
                style={unlocked ? {
                  background: 'linear-gradient(135deg, rgba(245,179,0,0.08) 0%, rgba(74,110,232,0.05) 100%)',
                  boxShadow: '0 4px 24px rgba(245,179,0,0.15), 0 0 0 1px rgba(245,179,0,0.2)',
                } : undefined}
              >
                {/* Glow blob behind icon (unlocked only) */}
                {unlocked && (
                  <div
                    className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 h-16 w-16 rounded-full blur-2xl"
                    aria-hidden="true"
                    style={{ background: 'radial-gradient(circle, rgba(245,179,0,0.35) 0%, transparent 70%)' }}
                  />
                )}

                {/* Lock overlay (locked only) */}
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      className="text-muted-foreground/40">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                )}

                <div className="relative z-10">
                  <div className="mb-3 text-4xl"
                    style={unlocked ? { filter: 'drop-shadow(0 2px 8px rgba(245,179,0,0.5))' } : undefined}>
                    {meta.icon}
                  </div>
                  <p className="text-sm font-bold text-foreground">{meta.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{meta.desc}</p>
                  {unlocked && (
                    <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-bold text-accent">
                      ✓ Unlocked
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
