import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { lostFoundApi } from '../services/lostFoundApi'
import type { ItemType, LostFoundItem } from '../types'
import { useAuthStore } from '@/shared/store/authStore'
import { Button, EmptyState, Input, Modal, Textarea } from '@/shared/components/ui'
import { cn } from '@/shared/lib/cn'
import { toast } from '@/shared/store/toastStore'
import { useThemeStore } from '@/shared/store/themeStore'
import { lostFoundDetailPath } from '@/shared/routes/paths'

const schema = z.object({
  type: z.enum(['LOST', 'FOUND']),
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  location: z.string().min(3).max(300),
  itemDate: z.string().min(1, 'Date is required'),
  contact: z.string().min(3).max(200),
})

type FormValues = z.infer<typeof schema>

// ── Image Lightbox ────────────────────────────────────────────────────────────

function ImageLightbox({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image"
        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <img
        src={url}
        alt="Item image"
        className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

// ── Item Card ─────────────────────────────────────────────────────────────────

function ItemCard({ item, onResolve, onDelete, isOwner }: {
  item: LostFoundItem
  onResolve: (id: string) => void
  onDelete: (id: string) => void
  isOwner: boolean
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isLost     = item.type === 'LOST'
  const isResolved = item.status === 'RESOLVED'
  const isDark     = useThemeStore((s) => s.theme === 'dark')

  const lostStyle = {
    borderColor: isDark ? 'rgba(251,191,36,0.25)' : 'rgba(217,119,6,0.22)',
    background: isDark ? 'rgba(251,191,36,0.04)' : 'rgba(245,179,0,0.03)',
  }
  const foundStyle = {
    borderColor: isDark ? 'rgba(52,211,153,0.25)' : 'rgba(5,150,105,0.20)',
    background: isDark ? 'rgba(52,211,153,0.04)' : 'rgba(5,150,105,0.03)',
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]',
        isResolved && 'opacity-55',
      )}
      style={isLost ? lostStyle : foundStyle}
    >
      {/* Top: type badge + date */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em]',
              isLost
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            )}
          >
            {isLost ? (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            ) : (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {item.type}
          </span>

          {isResolved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Resolved
            </span>
          )}
        </div>

        <time className="text-[10px] font-medium text-muted-foreground">
          {new Date(item.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
        </time>
      </div>

      {/* Image thumbnail */}
      {item.imageUrl && (
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="mb-2 block w-full overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="View full image"
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-32 w-full object-cover transition-transform duration-200 hover:scale-105"
          />
        </button>
      )}

      {/* Title — links to detail */}
      <Link
        to={lostFoundDetailPath(item.id)}
        className="text-sm font-bold leading-snug text-foreground transition-colors hover:text-primary"
      >
        {item.title}
      </Link>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>

      {/* Meta row */}
      <div className="mt-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          {item.location}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {item.itemDate}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          {item.reporterName}
        </div>
      </div>

      {/* Reaction + comment counts */}
      <div className="mt-2 flex items-center gap-3">
        {item.reactionCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            👍 {item.reactionCount}
          </span>
        )}
        {item.commentCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            💬 {item.commentCount}
          </span>
        )}
        <Link to={lostFoundDetailPath(item.id)} className="ml-auto text-[11px] font-semibold text-primary hover:underline">
          View post →
        </Link>
      </div>

      {/* Contact + resolve */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3"
        style={{ borderColor: isLost
          ? 'rgba(217,119,6,0.12)'
          : 'rgba(5,150,105,0.12)'
        }}
      >
        <p className="text-[11px] text-muted-foreground truncate min-w-0">
          <span className="font-medium text-foreground">Contact: </span>
          <span className={isLost ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
            {item.contact}
          </span>
        </p>
        {isOwner && (
          <div className="flex shrink-0 items-center gap-1.5">
            {!isResolved && (
              <button
                type="button"
                onClick={() => onResolve(item.id)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all hover:-translate-y-0.5',
                  'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
                  'dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50',
                )}
              >
                Mark Resolved
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all hover:-translate-y-0.5',
                'bg-red-100 text-red-600 hover:bg-red-200',
                'dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50',
              )}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && item.imageUrl && (
        <ImageLightbox url={item.imageUrl} onClose={() => setLightboxOpen(false)} />
      )}

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className={cn(
              'mx-4 w-full max-w-sm rounded-2xl border p-6 shadow-2xl',
              isDark ? 'bg-[#12151e] border-white/10' : 'bg-white border-border',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-foreground">Delete this item?</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              This will permanently remove "{item.title}" and cannot be undone.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className={cn(
                  'flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-colors',
                  isDark ? 'border-white/10 text-muted-foreground hover:bg-white/5' : 'border-border text-muted-foreground hover:bg-surface-muted',
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { setConfirmDelete(false); onDelete(item.id) }}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-600 active:scale-[0.97]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Post Form Modal ───────────────────────────────────────────────────────────

function PostItemModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'LOST' },
  })

  const typeVal  = watch('type')
  const titleVal = watch('title') ?? ''
  const descVal  = watch('description') ?? ''

  const mutation = useMutation({
    mutationFn: (vals: FormValues) => lostFoundApi.create({ ...vals, imageUrl: null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lost-found'] })
      toast.success('Item posted successfully!')
      onClose()
      reset()
    },
    onError: () => toast.error('Failed to post item. Please try again.'),
  })

  const isLostMode = typeVal === 'LOST'

  return (
    <Modal isOpen={open} onClose={onClose} title="Post Lost / Found Item">
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="flex flex-col gap-4">
        {/* Type toggle */}
        <div className="flex gap-2 p-1 rounded-xl bg-surface-muted">
          {(['LOST', 'FOUND'] as ItemType[]).map((t) => (
            <label key={t} className="flex-1">
              <input type="radio" value={t} {...register('type')} className="sr-only" />
              <span
                className={cn(
                  'flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all',
                  t === typeVal
                    ? t === 'LOST'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-emerald-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t === 'LOST' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {t === 'LOST' ? 'I Lost Something' : 'I Found Something'}
              </span>
            </label>
          ))}
        </div>

        <div>
          <Input
            label="Item Name"
            placeholder="e.g. Blue NU Laguna ID Lace"
            {...register('title')}
            error={errors.title?.message}
          />
          <p className={cn('mt-1 text-right text-xs', titleVal.length >= 180 ? 'text-danger' : 'text-muted-foreground')}>
            {titleVal.length}/200
          </p>
        </div>

        <div>
          <Textarea
            label="Description"
            placeholder="Describe the item — color, size, any distinctive marks..."
            {...register('description')}
            error={errors.description?.message}
          />
          <p className={cn('mt-1 text-right text-xs', descVal.length >= 450 ? 'text-danger' : 'text-muted-foreground')}>
            {descVal.length} chars
          </p>
        </div>

        <Input
          label="Location"
          placeholder="e.g. Library 2nd floor, near the stairs"
          {...register('location')}
          error={errors.location?.message}
        />
        <Input
          label="Date"
          type="date"
          {...register('itemDate')}
          error={errors.itemDate?.message}
        />
        <Input
          label="Contact Info"
          placeholder="e.g. messenger: @username, or email"
          {...register('contact')}
          error={errors.contact?.message}
        />

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={mutation.isPending}
            className="flex-1"
            style={!mutation.isPending ? {
              background: isLostMode
                ? 'linear-gradient(135deg, #d97706, #f59e0b)'
                : 'linear-gradient(135deg, #059669, #10b981)',
              borderColor: 'transparent',
              color: 'white',
            } : undefined}
          >
            Post Item
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type FilterType = 'ALL' | 'LOST' | 'FOUND'

const FILTER_TABS: { value: FilterType; label: string; activeStyle: React.CSSProperties; defaultStyle: (dark: boolean) => React.CSSProperties }[] = [
  {
    value: 'ALL',
    label: 'All Items',
    activeStyle: { background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.4)', color: '#6366f1' },
    defaultStyle: (dark) => ({ background: dark ? 'rgba(255,255,255,0.04)' : 'white', borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)', color: dark ? '#99a1b3' : '#5b6472' }),
  },
  {
    value: 'LOST',
    label: 'Lost',
    activeStyle: { background: 'rgba(245,179,0,0.12)', borderColor: 'rgba(217,119,6,0.35)', color: '#d97706' },
    defaultStyle: (dark) => ({ background: dark ? 'rgba(255,255,255,0.04)' : 'white', borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)', color: dark ? '#99a1b3' : '#5b6472' }),
  },
  {
    value: 'FOUND',
    label: 'Found',
    activeStyle: { background: 'rgba(5,150,105,0.10)', borderColor: 'rgba(5,150,105,0.30)', color: '#059669' },
    defaultStyle: (dark) => ({ background: dark ? 'rgba(255,255,255,0.04)' : 'white', borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)', color: dark ? '#99a1b3' : '#5b6472' }),
  },
]

export function LostFoundPage() {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const user   = useAuthStore((s) => s.user)
  const qc     = useQueryClient()
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [showForm, setShowForm] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [activeKw, setActiveKw] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleKeywordChange = (v: string) => {
    setKeyword(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setActiveKw(v), 400)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['lost-found', filter, activeKw],
    queryFn:  () => lostFoundApi.browse({
      type: filter === 'ALL' ? undefined : filter,
      keyword: activeKw || undefined,
    }),
    staleTime: 60_000,
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) => lostFoundApi.resolve(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['lost-found'] })
      toast.success('Item marked as resolved!')
    },
    onError: () => toast.error('Could not resolve item.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => lostFoundApi.delete(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['lost-found'] })
      qc.invalidateQueries({ queryKey: ['lost-found-mine'] })
      toast.success('Item deleted.')
    },
    onError: () => toast.error('Could not delete item.'),
  })

  const items = data?.content ?? []

  const lostCount    = items.filter((i) => i.type === 'LOST' && i.status !== 'RESOLVED').length
  const foundCount   = items.filter((i) => i.type === 'FOUND' && i.status !== 'RESOLVED').length
  const resolvedCount = items.filter((i) => i.status === 'RESOLVED').length

  return (
    <div className="flex flex-col gap-6 animate-[page-enter_0.3s_ease-out]">

      {/* ── EDITORIAL HERO ─────────────────────────────────────────── */}
      <div
        className="relative -mx-4 -mt-8 overflow-hidden sm:-mx-6"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 15% 70%, rgba(245,158,11,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.07) 0%, transparent 50%), #0a0d14'
            : 'radial-gradient(ellipse at 15% 70%, rgba(245,158,11,0.10) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.07) 0%, transparent 50%), #f7f8fa',
        }}
      >
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12] dark:opacity-[0.05]"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(245,158,11,0.5) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Large BG letter */}
        <div
          className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none text-[160px] font-black leading-none opacity-[0.03]"
          aria-hidden="true"
          style={{ color: isDark ? '#fff' : '#d97706' }}
        >
          L
        </div>

        <div className="relative z-10 px-4 pt-8 pb-6 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            {/* Headline */}
            <div>
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 dark:text-amber-400">
                Community Board
              </p>
              <h1 className={cn(
                'text-4xl font-black leading-none tracking-tight sm:text-5xl',
                isDark ? 'text-white' : 'text-foreground',
              )}>
                Lost &amp; Found
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Help the campus community — post lost items or things you've found.
              </p>

              {/* Quick stats */}
              {data && !isLoading && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {lostCount} lost
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {foundCount} found
                  </span>
                  {resolvedCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                      {resolvedCount} resolved
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Post button */}
            <Button
              onClick={() => setShowForm(true)}
              className="gap-1.5 shrink-0"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Post Item
            </Button>
          </div>
        </div>

        {/* Bottom rule */}
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 h-px"
          aria-hidden="true"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.4) 35%, rgba(5,150,105,0.3) 65%, transparent 100%)',
          }}
        />
      </div>

      {/* ── SEARCH ─────────────────────────────────────────────────── */}
      <div className={cn(
        'flex items-center gap-2 rounded-xl border px-3 py-2',
        isDark ? 'border-white/10 bg-white/[0.03]' : 'border-border bg-white',
      )}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-muted-foreground">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          placeholder="Search lost & found items…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {keyword && (
          <button
            onClick={() => { setKeyword(''); setActiveKw('') }}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── FILTER TABS ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-all"
            style={filter === tab.value ? tab.activeStyle : tab.defaultStyle(isDark)}
          >
            {tab.value === 'LOST' && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            )}
            {tab.value === 'FOUND' && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── ITEMS GRID ─────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Nothing here yet"
          description="Be the first to post a lost or found item."
          action={<Button onClick={() => setShowForm(true)}>Post Item</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onResolve={(id) => resolveMutation.mutate(id)}
              onDelete={(id) => deleteMutation.mutate(id)}
              isOwner={item.reporterId === user?.id}
            />
          ))}
        </div>
      )}

      {/* Post form modal */}
      <PostItemModal open={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}
