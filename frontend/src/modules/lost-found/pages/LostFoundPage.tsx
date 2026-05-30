import { useState } from 'react'
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

const schema = z.object({
  type: z.enum(['LOST', 'FOUND']),
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  location: z.string().min(3).max(300),
  itemDate: z.string().min(1, 'Date is required'),
  contact: z.string().min(3).max(200),
})

type FormValues = z.infer<typeof schema>

function ItemCard({ item, onResolve, isOwner }: {
  item: LostFoundItem
  onResolve: (id: string) => void
  isOwner: boolean
}) {
  const isLost = item.type === 'LOST'
  const isResolved = item.status === 'RESOLVED'

  return (
    <div
      className={cn(
        'group rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg',
        isLost
          ? 'border-amber-200 bg-amber-50/40 dark:border-amber-800/40 dark:bg-amber-950/15'
          : 'border-green-200 bg-green-50/40 dark:border-green-800/40 dark:bg-green-950/15',
        isResolved && 'opacity-60',
      )}
    >
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider',
              isLost
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
            )}
          >
            {item.type}
          </span>
          {isResolved && (
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-muted-foreground">
              ✓ Resolved
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>

      <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">{item.description}</p>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>📍 {item.location}</span>
        <span>📅 {item.itemDate}</span>
        <span>👤 {item.reporterName}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">
          Contact: <span className="text-primary">{item.contact}</span>
        </span>
        {isOwner && !isResolved && (
          <button
            onClick={() => onResolve(item.id)}
            className="rounded-lg bg-green-100 px-3 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
          >
            Mark Resolved
          </button>
        )}
      </div>
    </div>
  )
}

export function LostFoundPage() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [filter, setFilter] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL')
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['lost-found', filter],
    queryFn: () => lostFoundApi.browse({ type: filter === 'ALL' ? undefined : filter }),
    staleTime: 60_000,
  })

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'LOST' },
  })
  const titleVal = watch('title') ?? ''
  const descVal  = watch('description') ?? ''

  const createMutation = useMutation({
    mutationFn: (vals: FormValues) => lostFoundApi.create(vals),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lost-found'] })
      toast.success('Item posted successfully!')
      setShowForm(false)
      reset()
    },
    onError: () => toast.error('Failed to post item. Please try again.'),
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) => lostFoundApi.resolve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lost-found'] })
      toast.success('Item marked as resolved!')
    },
    onError: () => toast.error('Could not resolve item.'),
  })

  const items = data?.content ?? []

  return (
    <div className="flex flex-col gap-6 animate-[page-enter_0.3s_ease-out]">
      {/* ── Atmospheric header ──────────────────────────────────────── */}
      <div
        className="relative -mx-4 -mt-8 overflow-hidden px-4 pt-8 pb-6 sm:-mx-6 sm:px-6"
        style={{
          background:
            'radial-gradient(ellipse at 15% 60%, rgba(245,158,11,0.14) 0%, transparent 55%),' +
            'radial-gradient(ellipse at 75% 30%, rgba(234,179,8,0.10) 0%, transparent 50%),' +
            'radial-gradient(ellipse at 90% 80%, rgba(34,197,94,0.08) 0%, transparent 45%)',
        }}
      >
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
              Community Board
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Lost &amp; Found
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Help the campus community — post lost items or things you've found.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="mt-1 shrink-0">
            + Post Item
          </Button>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <div className="flex gap-2">
        {(['ALL', 'LOST', 'FOUND'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
              filter === f
                ? f === 'LOST'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                  : f === 'FOUND'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                  : 'bg-surface-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {f === 'ALL' ? '📋 All' : f === 'LOST' ? '🔍 Lost' : '✅ Found'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
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
              isOwner={item.reporterId === user?.id}
            />
          ))}
        </div>
      )}

      {/* Post form modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Post Lost / Found Item">
        <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="flex flex-col gap-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            {(['LOST', 'FOUND'] as ItemType[]).map((t) => (
              <label key={t} className="flex-1">
                <input type="radio" value={t} {...register('type')} className="sr-only" />
                <span
                  className={cn(
                    'flex cursor-pointer items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
                    t === 'LOST'
                      ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                      : 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-400',
                  )}
                >
                  {t === 'LOST' ? '🔍 I Lost Something' : '✅ I Found Something'}
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

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending} className="flex-1">
              Post Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
