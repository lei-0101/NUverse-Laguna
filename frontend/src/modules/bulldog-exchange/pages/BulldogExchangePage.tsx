import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui'
import { cn } from '@/shared/lib/cn'
import { useAuthStore } from '@/shared/store/authStore'
import { paths } from '@/shared/routes/paths'
import { MERCHANDISE_CATEGORIES, formatCategory } from '../schemas'
import { useProducts } from '../hooks/useBulldogExchange'
import { ProductGrid } from '../components/ProductGrid'
import type { MerchandiseCategory, MerchandiseGender } from '../types'
import { useThemeStore } from '@/shared/store/themeStore'

// ── Category icons ────────────────────────────────────────────────────────────

const CAT_ICONS: Partial<Record<MerchandiseCategory, React.ReactNode>> = {
  CLOTHING: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
    </svg>
  ),
  ACCESSORIES: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
    </svg>
  ),
  STATIONERY: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  BAGS: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  EQUIPMENT: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  ),
  SHS: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  OTHER: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
    </svg>
  ),
}

// ── Page ──────────────────────────────────────────────────────────────────────

const GENDERS: { value: MerchandiseGender | null; label: string }[] = [
  { value: null,      label: 'All'     },
  { value: 'MALE',   label: 'Male'    },
  { value: 'FEMALE', label: 'Female'  },
  { value: 'UNISEX', label: 'Unisex'  },
]

export function BulldogExchangePage() {
  const isDark  = useThemeStore((s) => s.theme === 'dark')
  const [category, setCategory] = useState<MerchandiseCategory | null>(null)
  const [gender,      setGender]      = useState<MerchandiseGender | null>(null)
  const [keyword,     setKeyword]     = useState('')
  const [activeKw,    setActiveKw]    = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [page, setPage] = useState(0)
  const navigate = useNavigate()
  const user     = useAuthStore((state) => state.user)
  const isAdmin  = user?.role === 'ROLE_ADMIN'

  const handleKeywordChange = (v: string) => {
    setKeyword(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setActiveKw(v); setPage(0) }, 400)
  }

  const { data, isLoading, isError } = useProducts(category, gender, activeKw || null, page)

  const handleCategory = (next: MerchandiseCategory | null) => {
    setCategory(next)
    setPage(0)
  }

  const handleGender = (next: MerchandiseGender | null) => {
    setGender(next)
    setPage(0)
  }

  return (
    <div className="flex flex-col gap-6 animate-[page-enter_0.3s_ease-out]">

      {/* ── FLAGSHIP HERO ──────────────────────────────────────────── */}
      <div
        className="relative -mx-4 -mt-8 overflow-hidden sm:-mx-6"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 20% 50%, rgba(245,179,0,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(217,119,6,0.08) 0%, transparent 50%), #0a0d14'
            : 'radial-gradient(ellipse at 20% 50%, rgba(245,179,0,0.14) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(217,119,6,0.10) 0%, transparent 50%), #f7f8fa',
        }}
      >
        {/* Diagonal stripes texture — subtle premium feel */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          aria-hidden="true"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              ${isDark ? 'rgba(245,179,0,0.8)' : 'rgba(217,119,6,0.6)'} 0px,
              ${isDark ? 'rgba(245,179,0,0.8)' : 'rgba(217,119,6,0.6)'} 1px,
              transparent 1px,
              transparent 20px
            )`,
          }}
        />

        {/* Large BG "X" for Exchange */}
        <div
          className="pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 select-none text-[160px] font-black leading-none opacity-[0.03]"
          aria-hidden="true"
          style={{ color: isDark ? '#f5b300' : '#d97706' }}
        >
          X
        </div>

        <div className="relative z-10 px-4 pt-8 pb-6 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            {/* Headline */}
            <div>
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 dark:text-amber-400">
                Official NU Laguna Merchandise
              </p>
              <h1 className={cn(
                'text-4xl font-black leading-none tracking-tight sm:text-5xl',
                isDark ? 'text-white' : 'text-foreground',
              )}>
                Bulldog Exchange
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Reserve official NU merchandise. Limited slots per item.
              </p>

              {data && (
                <div
                  className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold backdrop-blur-sm"
                  style={{
                    background: isDark ? 'rgba(245,179,0,0.10)' : 'rgba(245,179,0,0.08)',
                    borderColor: isDark ? 'rgba(245,179,0,0.30)' : 'rgba(217,119,6,0.25)',
                    color: isDark ? '#fbbf24' : '#d97706',
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-amber-500"
                    style={{ animation: 'dot-pulse 2s ease-in-out infinite' }}
                  />
                  {data.totalElements} product{data.totalElements !== 1 ? 's' : ''} available
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => navigate(paths.myReservations)}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all hover:-translate-y-0.5',
                  isDark
                    ? 'border-white/12 bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/8'
                    : 'border-border bg-surface text-muted-foreground hover:text-foreground hover:shadow-sm',
                )}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
                My Reservations
              </button>
              {isAdmin && (
                <Button
                  size="sm"
                  onClick={() => navigate(paths.exchangeNew)}
                  className="gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, #d97706, #f5b300)',
                    borderColor: 'transparent',
                    color: '#1a1d24',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  New Product
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Gold bottom rule */}
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 h-px"
          aria-hidden="true"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(245,179,0,0.5) 30%, rgba(245,179,0,0.35) 65%, transparent 100%)',
          }}
        />
      </div>

      {/* ── RESERVATION INFO STRIP ─────────────────────────────────── */}
      <div
        className="flex items-center gap-3 rounded-xl border px-4 py-3"
        style={{
          background: isDark ? 'rgba(245,179,0,0.06)' : 'rgba(245,179,0,0.05)',
          borderColor: isDark ? 'rgba(245,179,0,0.2)' : 'rgba(245,179,0,0.18)',
        }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: isDark ? 'rgba(245,179,0,0.15)' : 'rgba(245,179,0,0.12)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#fbbf24' : '#d97706'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Reservation policy:</span>{' '}
          Max 2 reservations per product. Reservations expire after{' '}
          <span className="font-semibold" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>48 hours</span>.
        </p>
      </div>

      {/* ── SEARCH ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className={cn(
          'flex flex-1 min-w-[200px] items-center gap-2 rounded-xl border px-3 py-2',
          isDark ? 'border-white/10 bg-white/[0.03]' : 'border-border bg-white',
        )}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            placeholder="Search products…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {keyword && (
            <button onClick={() => { setKeyword(''); setActiveKw(''); setPage(0) }} className="text-muted-foreground hover:text-foreground">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
        {/* Gender filter */}
        <div className="flex items-center gap-1">
          {GENDERS.map(({ value, label }) => (
            <button
              key={label}
              onClick={() => handleGender(value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-bold transition-all',
                gender === value
                  ? isDark
                    ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                    : 'border-amber-500/35 bg-amber-500/10 text-amber-700'
                  : isDark
                    ? 'border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground'
                    : 'border-border bg-white text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CATEGORY FILTER ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar" role="tablist" aria-label="Product categories">
        <button
          role="tab"
          aria-selected={category === null}
          onClick={() => handleCategory(null)}
          className="shrink-0 flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-all whitespace-nowrap"
          style={category === null ? {
            background: isDark ? 'rgba(245,179,0,0.15)' : 'rgba(245,179,0,0.10)',
            borderColor: isDark ? 'rgba(245,179,0,0.5)' : 'rgba(217,119,6,0.35)',
            color: isDark ? '#fbbf24' : '#d97706',
          } : {
            background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
            borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
            color: isDark ? '#99a1b3' : '#5b6472',
          }}
        >
          All Products
        </button>
        {MERCHANDISE_CATEGORIES.map((cat) => {
          const isActive = category === cat
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleCategory(cat)}
              className="shrink-0 flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-all whitespace-nowrap"
              style={isActive ? {
                background: isDark ? 'rgba(245,179,0,0.15)' : 'rgba(245,179,0,0.10)',
                borderColor: isDark ? 'rgba(245,179,0,0.5)' : 'rgba(217,119,6,0.35)',
                color: isDark ? '#fbbf24' : '#d97706',
              } : {
                background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
                borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
                color: isDark ? '#99a1b3' : '#5b6472',
              }}
            >
              {CAT_ICONS[cat]}
              {formatCategory(cat)}
            </button>
          )
        })}
      </div>

      {/* ── PRODUCT GRID ───────────────────────────────────────────── */}
      <ProductGrid
        products={data?.content}
        isLoading={isLoading}
        isError={isError}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        emptyTitle="No products available"
        emptyDescription={
          category
            ? `No ${formatCategory(category).toLowerCase()} products right now. Check back soon.`
            : 'No merchandise is available at the moment. Check back soon.'
        }
      />
    </div>
  )
}
