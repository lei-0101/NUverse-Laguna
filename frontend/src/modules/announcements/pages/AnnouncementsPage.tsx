import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementsApi } from '../services/announcementsApi'
import type { Announcement } from '../types'
import { useAuthStore } from '@/shared/store/authStore'
import { useThemeStore } from '@/shared/store/themeStore'
import { cn } from '@/shared/lib/cn'
import { Pagination } from '@/shared/components/ui'
import { announcementDetailPath, editAnnouncementPath } from '@/shared/routes/paths'
import { ReactionsModal } from '@/shared/components/ReactionsModal'

const PRIORITY_CONFIG: Record<string, { label: string; bar: string; badge: string; icon: string; glow: string }> = {
  CRITICAL:  { label: 'Critical',  bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',       icon: '🚨', glow: 'rgba(239,68,68,0.07)'   },
  IMPORTANT: { label: 'Important', bar: 'bg-amber-400',  badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: '📣', glow: 'rgba(251,191,36,0.07)'  },
  GENERAL:   { label: 'General',   bar: 'bg-primary',    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',     icon: '📌', glow: 'rgba(74,110,232,0.06)' },
}

const REACTION_EMOJIS = ['👍', '❤️', '😮', '🙏', '🎉']

function AnnouncementCard({
  ann, isDark, canManage, isAdmin,
}: {
  ann: Announcement
  isDark: boolean
  canManage: boolean
  isAdmin: boolean
}) {
  const queryClient = useQueryClient()
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showReactionsModal, setShowReactionsModal] = useState(false)

  const { data: reactions = [], isLoading: reactionsLoading } = useQuery({
    queryKey: ['announcement', ann.id, 'reactions'],
    queryFn: () => announcementsApi.getReactions(ann.id),
    enabled: showReactionsModal,
  })

  const cfg = PRIORITY_CONFIG[ann.priority] ?? PRIORITY_CONFIG.GENERAL
  const date = new Date(ann.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' })
  const expired = !ann.active || (ann.expiresAt != null && new Date(ann.expiresAt) < new Date())

  const reactMutation = useMutation({
    mutationFn: (emoji: string) => announcementsApi.toggleReaction(ann.id, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', 'browse'] })
      setShowEmojiPicker(false)
    },
  })

  const archiveMutation = useMutation({
    mutationFn: () => ann.active ? announcementsApi.deactivate(ann.id) : announcementsApi.activate(ann.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements', 'browse'] }),
  })

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: () => announcementsApi.delete(ann.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', 'browse'] })
      setDeleteTarget(null)
    },
  })

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border transition-all duration-200',
        isDark
          ? 'border-white/8 bg-white/[0.02] hover:bg-white/[0.04]'
          : 'border-border bg-surface hover:shadow-md',
        expired && 'opacity-60',
      )}
      style={{ background: isDark ? `radial-gradient(ellipse at 0% 50%, ${cfg.glow} 0%, transparent 60%)` : undefined }}
    >
      {/* Priority colour bar */}
      <div className={cn('absolute left-0 inset-y-0 w-1 rounded-l-2xl', cfg.bar)} />

      {/* Thumbnail */}
      {ann.imageUrl && (
        <div className="ml-1 aspect-[3/1] w-full overflow-hidden">
          <img
            src={ann.imageUrl}
            alt={ann.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="pl-5 pr-4 py-4">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold', cfg.badge)}>
              <span>{cfg.icon}</span>{cfg.label}
            </span>
            {expired && (
              <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                Archived
              </span>
            )}
          </div>
          <time className="text-[11px] text-muted-foreground">{date}</time>
        </div>

        {/* Title — clickable to detail */}
        <Link
          to={announcementDetailPath(ann.id)}
          className={cn('mt-2 block text-base font-bold leading-snug transition-colors hover:text-primary', isDark ? 'text-white' : 'text-foreground')}
        >
          {ann.title}
        </Link>

        {/* Body preview */}
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {ann.body}
        </p>

        {ann.body.length > 200 && (
          <Link
            to={announcementDetailPath(ann.id)}
            className="mt-1 text-xs font-semibold text-primary hover:underline"
          >
            Read more →
          </Link>
        )}

        {/* Footer — reactions + admin actions */}
        <div className="mt-3 flex items-center justify-between gap-2">
          {/* Reaction toggle */}
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setShowEmojiPicker((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-all hover:-translate-y-0.5',
                ann.userReaction
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : isDark
                    ? 'border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground'
                    : 'border-border bg-white text-muted-foreground hover:text-foreground',
              )}
            >
              {ann.userReaction ?? '👍'}
              {ann.reactionCount > 0 && <span>{ann.reactionCount}</span>}
            </button>
            {ann.reactionCount > 0 && (
              <button
                onClick={() => setShowReactionsModal(true)}
                className="text-[10px] text-muted-foreground hover:text-primary hover:underline transition-colors"
              >
                See who reacted
              </button>
            )}

            {showEmojiPicker && (
              <div
                className={cn(
                  'absolute bottom-full left-0 z-20 mb-2 flex gap-1 rounded-2xl border px-3 py-2 shadow-xl',
                  isDark ? 'border-white/10 bg-[#1a1d24]' : 'border-border bg-white',
                )}
              >
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => reactMutation.mutate(emoji)}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-lg transition-all hover:scale-125',
                      ann.userReaction === emoji && 'bg-primary/10',
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin actions */}
          {canManage && (
            <div className="flex items-center gap-1.5">
              <Link
                to={editAnnouncementPath(ann.id)}
                className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground hover:bg-surface-muted"
              >
                Edit
              </Link>
              <button
                onClick={() => archiveMutation.mutate()}
                disabled={archiveMutation.isPending}
                className={cn(
                  'rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors',
                  ann.active
                    ? 'border-amber-300/40 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20'
                    : 'border-emerald-300/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400',
                )}
              >
                {ann.active ? 'Archive' : 'Restore'}
              </button>
              {isAdmin && (
                <button
                  onClick={() => setDeleteTarget(ann.id)}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg border border-red-300/30 px-2.5 py-1 text-[11px] font-semibold text-danger transition-colors hover:bg-danger/5"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <ReactionsModal
        isOpen={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
        reactions={reactions}
        isLoading={reactionsLoading}
      />

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(4,7,18,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className={cn('w-full max-w-sm overflow-hidden rounded-2xl border', isDark ? 'border-white/10 bg-[#12141a]' : 'border-border bg-white')}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-danger" />
            <div className="p-6">
              <p className="text-base font-bold text-foreground mb-1">Delete Announcement?</p>
              <p className="text-sm text-muted-foreground mb-5">This will permanently remove the announcement and cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className={cn('flex-1 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors', isDark ? 'border-white/12 text-muted-foreground hover:text-foreground' : 'border-border text-muted-foreground hover:text-foreground')}>
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="flex-1 rounded-xl bg-danger px-4 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AnnouncementsPage() {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const user   = useAuthStore((s) => s.user)
  const isAdmin   = user?.role === 'ROLE_ADMIN'
  const isFaculty = user?.role === 'ROLE_FACULTY'
  const canManage = isAdmin || isFaculty

  const [page, setPage] = useState(0)
  const PAGE_SIZE = 15

  const { data, isLoading } = useQuery({
    queryKey: ['announcements', 'browse', page],
    queryFn:  () => announcementsApi.browse(page, PAGE_SIZE),
    staleTime: 60_000,
  })

  const items      = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const active     = items.filter((a) => a.active && (a.expiresAt == null || new Date(a.expiresAt) >= new Date()))
  const archived   = items.filter((a) => !active.includes(a))

  return (
    <div className="mx-auto max-w-2xl animate-[page-enter_0.3s_ease-out]">

      {/* ── HEADER ───────────────────────────────────────────────────── */}
      <div
        className="relative -mx-4 -mt-8 mb-6 overflow-hidden px-4 pt-8 pb-6 sm:-mx-6 sm:px-6"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 20% 60%, rgba(74,110,232,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(245,179,0,0.07) 0%, transparent 50%), #0a0d14'
            : 'radial-gradient(ellipse at 20% 60%, rgba(74,110,232,0.08) 0%, transparent 55%), #f7f8fa',
        }}
      >
        {/* Decorative watermark */}
        <div
          className="pointer-events-none absolute right-2 bottom-0 select-none text-[120px] font-black leading-none opacity-[0.025]"
          aria-hidden="true"
          style={{ color: isDark ? '#fff' : '#1f3a8a' }}
        >
          📢
        </div>

        <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
          NU Laguna Official
        </p>
        <h1 className={cn(
          'text-3xl font-black leading-none tracking-tight sm:text-4xl',
          isDark ? 'text-white' : 'text-foreground',
        )}>
          Announcements
        </h1>
        {!isLoading && data && (
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{active.length}</span> active ·{' '}
            <span className="font-bold text-foreground">{data.totalElements}</span> total
          </p>
        )}
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn('h-32 animate-pulse rounded-2xl', isDark ? 'bg-white/5' : 'bg-border/40')} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className={cn('rounded-2xl border p-12 text-center', isDark ? 'border-white/8' : 'border-border')}>
          <p className="text-5xl">📭</p>
          <p className="mt-3 text-lg font-bold text-foreground">No announcements yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Check back later for updates from NU Laguna.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {active.length > 0 && (
            <>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Active</p>
              {active.map((ann) => (
                <AnnouncementCard
                  key={ann.id} ann={ann} isDark={isDark}
                  canManage={canManage} isAdmin={isAdmin}
                />
              ))}
            </>
          )}
          {archived.length > 0 && (
            <>
              <p className={cn('text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground', active.length > 0 && 'mt-4')}>
                Archived
              </p>
              {archived.map((ann) => (
                <AnnouncementCard
                  key={ann.id} ann={ann} isDark={isDark}
                  canManage={canManage} isAdmin={isAdmin}
                />
              ))}
            </>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
