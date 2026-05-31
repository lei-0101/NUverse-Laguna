import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui'
import { paths } from '@/shared/routes/paths'
import { useListings } from '../hooks/useMarketplace'
import { ListingGrid } from '../components/ListingGrid'
import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
  formatCategory,
  formatCondition,
} from '../schemas'
import type { ListingCategory, ListingCondition, ListingFilters } from '../types'
import { cn } from '@/shared/lib/cn'
import { useThemeStore } from '@/shared/store/themeStore'

// ── Category icons (SVG inline) ──────────────────────────────────────────────

const CATEGORY_ICONS: Record<ListingCategory, React.ReactNode> = {
  SCHOOL_SUPPLIES: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l-7-7 7-7 7 7-7 7z" /><path d="M12 5V3M5 12H3M21 12h-2M12 21v-2" />
    </svg>
  ),
  BOOKS: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
  GADGETS: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" /><circle cx="12" cy="17" r="1" />
    </svg>
  ),
  UNIFORMS: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  ACCESSORIES: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  ),
  DORM_ESSENTIALS: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  FOOD: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  SERVICES: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93A10 10 0 1114.24 3.5" />
    </svg>
  ),
  ART_COMMISSIONS: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" />
    </svg>
  ),
}

const CONDITION_COLORS: Record<ListingCondition, string> = {
  NEW:      'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40',
  LIKE_NEW: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40',
  GOOD:     'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/40',
  FAIR:     'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40',
}

// ── Inline Filter Panel ───────────────────────────────────────────────────────

interface InlineFiltersProps {
  filters: ListingFilters
  onChange: (f: ListingFilters) => void
}

function InlineFilters({ filters, onChange }: InlineFiltersProps) {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const [keyword, setKeyword] = useState(filters.keyword ?? '')
  const [priceOpen, setPriceOpen] = useState(false)
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() ?? '')
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() ?? '')
  const priceRef = useRef<HTMLDivElement>(null)

  const activeCategory = filters.category ?? null
  const activeCondition = filters.condition ?? null

  const applyKeyword = () => {
    onChange({ ...filters, keyword: keyword.trim() || undefined })
  }

  const clearCategory = () => onChange({ ...filters, category: undefined })
  const setCategory = (c: ListingCategory) => {
    onChange({ ...filters, category: c === activeCategory ? undefined : c })
  }

  const setCondition = (c: ListingCondition) => {
    onChange({ ...filters, condition: c === activeCondition ? undefined : c })
  }

  const applyPrice = () => {
    onChange({
      ...filters,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    })
    setPriceOpen(false)
  }

  const clearPrice = () => {
    setMinPrice('')
    setMaxPrice('')
    onChange({ ...filters, minPrice: undefined, maxPrice: undefined })
  }

  const clearAll = () => {
    setKeyword('')
    setMinPrice('')
    setMaxPrice('')
    onChange({})
  }

  const hasActiveFilters = !!(activeCategory || activeCondition || filters.minPrice || filters.maxPrice || filters.keyword)

  return (
    <div className="flex flex-col gap-3">
      {/* Search bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search listings, e.g. textbook, laptop bag..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyKeyword()}
          className={cn(
            'w-full rounded-xl border py-3 pl-11 pr-20 text-sm text-foreground placeholder:text-muted-foreground',
            'bg-surface border-border transition-all',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
          )}
        />
        <button
          type="button"
          onClick={applyKeyword}
          className={cn(
            'absolute inset-y-0 right-2 my-1.5 rounded-lg px-3 text-xs font-bold transition-colors',
            isDark
              ? 'bg-white/8 text-white hover:bg-white/12'
              : 'bg-foreground/8 text-foreground hover:bg-foreground/12',
          )}
        >
          Search
        </button>
      </div>

      {/* Category chips — horizontal scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
        {/* All pill */}
        <button
          type="button"
          onClick={clearCategory}
          className={cn(
            'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all',
            !activeCategory
              ? 'border-primary bg-primary text-white'
              : isDark
                ? 'border-white/12 bg-white/5 text-muted-foreground hover:border-white/25 hover:text-foreground'
                : 'border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground',
          )}
        >
          All
        </button>
        {LISTING_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              'shrink-0 flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap',
              activeCategory === cat
                ? 'border-primary bg-primary text-white'
                : isDark
                  ? 'border-white/12 bg-white/5 text-muted-foreground hover:border-white/25 hover:text-foreground'
                  : 'border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {CATEGORY_ICONS[cat]}
            {formatCategory(cat)}
          </button>
        ))}
      </div>

      {/* Secondary filter row: condition + price + clear */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Condition pills */}
        {LISTING_CONDITIONS.map((cond) => (
          <button
            key={cond}
            type="button"
            onClick={() => setCondition(cond)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-bold transition-all',
              activeCondition === cond
                ? CONDITION_COLORS[cond]
                : isDark
                  ? 'border-white/10 bg-white/4 text-muted-foreground hover:border-white/20'
                  : 'border-border bg-surface text-muted-foreground hover:border-border/80',
            )}
          >
            {formatCondition(cond)}
          </button>
        ))}

        {/* Price range dropdown */}
        <div className="relative" ref={priceRef}>
          <button
            type="button"
            onClick={() => setPriceOpen((o) => !o)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all',
              filters.minPrice || filters.maxPrice
                ? isDark
                  ? 'border-primary/60 bg-primary/15 text-primary'
                  : 'border-primary/50 bg-primary/8 text-primary'
                : isDark
                  ? 'border-white/10 bg-white/4 text-muted-foreground hover:border-white/20'
                  : 'border-border bg-surface text-muted-foreground hover:border-border/80',
            )}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 4h12M4 8h8M6 12h4" />
            </svg>
            {filters.minPrice || filters.maxPrice
              ? `₱${filters.minPrice ?? 0} – ₱${filters.maxPrice ?? '∞'}`
              : 'Price range'}
          </button>
          {priceOpen && (
            <div
              className={cn(
                'absolute top-8 left-0 z-20 flex min-w-48 flex-col gap-2 rounded-xl border p-3 shadow-[var(--shadow-lg)]',
                isDark ? 'bg-[#1a1f2e] border-white/12' : 'bg-surface border-border',
              )}
            >
              <input
                type="number"
                placeholder="Min ₱"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className={cn(
                  'w-full rounded-lg border py-1.5 px-2.5 text-xs text-foreground',
                  'bg-surface-muted border-border focus:outline-none focus:ring-1 focus:ring-primary/30',
                )}
              />
              <input
                type="number"
                placeholder="Max ₱"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={cn(
                  'w-full rounded-lg border py-1.5 px-2.5 text-xs text-foreground',
                  'bg-surface-muted border-border focus:outline-none focus:ring-1 focus:ring-primary/30',
                )}
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={clearPrice}
                  className="flex-1 rounded-lg border border-border py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={applyPrice}
                  className="flex-1 rounded-lg bg-primary py-1 text-xs font-bold text-white hover:bg-primary-hover"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-danger transition-all hover:bg-danger/8"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function MarketplacePage() {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const [filters, setFilters] = useState<ListingFilters>({})
  const [page, setPage] = useState(0)
  const navigate = useNavigate()

  const { data, isLoading, isError } = useListings(filters, page)

  const applyFilters = (next: ListingFilters) => {
    setFilters(next)
    setPage(0)
  }

  return (
    <div className="flex flex-col gap-6 animate-[page-enter_0.3s_ease-out]">

      {/* ── EDITORIAL HERO ─────────────────────────────────────────── */}
      <div
        className="relative -mx-4 -mt-8 overflow-hidden sm:-mx-6"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 15% 70%, rgba(5,150,105,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.07) 0%, transparent 50%), #0a0d14'
            : 'radial-gradient(ellipse at 15% 70%, rgba(5,150,105,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.08) 0%, transparent 50%), #f7f8fa',
        }}
      >
        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15] dark:opacity-[0.06]"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(5,150,105,0.6) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Large BG letter */}
        <div
          className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none text-[160px] font-black leading-none opacity-[0.025]"
          aria-hidden="true"
          style={{ color: isDark ? '#fff' : '#059669' }}
        >
          M
        </div>

        <div className="relative z-10 px-4 pt-8 pb-6 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            {/* Headline */}
            <div>
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 dark:text-emerald-400">
                Campus Store
              </p>
              <h1 className={cn(
                'text-4xl font-black leading-none tracking-tight sm:text-5xl',
                isDark ? 'text-white' : 'text-foreground',
              )}>
                Marketplace
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Buy and sell within the NU Laguna community.
              </p>

              {/* Live count */}
              {data && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold backdrop-blur-sm"
                  style={{
                    background: isDark ? 'rgba(5,150,105,0.1)' : 'rgba(5,150,105,0.06)',
                    borderColor: isDark ? 'rgba(5,150,105,0.3)' : 'rgba(5,150,105,0.2)',
                    color: isDark ? '#34d399' : '#059669',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-70" />
                  {data.totalElements.toLocaleString()} listing{data.totalElements !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => navigate(paths.savedListings)}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all hover:-translate-y-0.5',
                  isDark
                    ? 'border-white/12 bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/8'
                    : 'border-border bg-surface text-muted-foreground hover:text-foreground hover:shadow-sm',
                )}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
                Saved
              </button>
              <button
                type="button"
                onClick={() => navigate(paths.myListings)}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all hover:-translate-y-0.5',
                  isDark
                    ? 'border-white/12 bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/8'
                    : 'border-border bg-surface text-muted-foreground hover:text-foreground hover:shadow-sm',
                )}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                </svg>
                My Listings
              </button>
              <Button
                size="sm"
                onClick={() => navigate(paths.marketplaceNew)}
                className="gap-1.5"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New Listing
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom rule */}
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 h-px"
          aria-hidden="true"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(5,150,105,0.3) 40%, rgba(245,179,0,0.15) 70%, transparent 100%)',
          }}
        />
      </div>

      {/* ── FILTERS ────────────────────────────────────────────────── */}
      <InlineFilters filters={filters} onChange={applyFilters} />

      {/* ── LISTINGS GRID ──────────────────────────────────────────── */}
      <ListingGrid
        listings={data?.content}
        isLoading={isLoading}
        isError={isError}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        emptyTitle="No listings found"
        emptyDescription="Try adjusting your filters, or be the first to post something."
      />
    </div>
  )
}
