import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementsApi } from '../services/announcementsApi'
import { useAuthStore } from '@/shared/store/authStore'
import { useThemeStore } from '@/shared/store/themeStore'
import { cn } from '@/shared/lib/cn'
import { paths, editAnnouncementPath } from '@/shared/routes/paths'
import { toast } from '@/shared/store/toastStore'
import { ReactionsModal } from '@/shared/components/ReactionsModal'

const PRIORITY_CONFIG = {
  CRITICAL:  { label: 'Critical',  bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',      icon: '🚨' },
  IMPORTANT: { label: 'Important', bar: 'bg-amber-400',  badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: '📣' },
  GENERAL:   { label: 'General',   bar: 'bg-primary',    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',    icon: '📌' },
} as const

const REACTION_EMOJIS = ['👍', '❤️', '😮', '🙏', '🎉']

export function AnnouncementDetailPage() {
  const { announcementId = '' } = useParams()
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ROLE_ADMIN'
  const isFaculty = user?.role === 'ROLE_FACULTY'
  const canManage = isAdmin || isFaculty
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showReactionsModal, setShowReactionsModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: ann, isLoading } = useQuery({
    queryKey: ['announcement', announcementId],
    queryFn: () => announcementsApi.getById(announcementId),
    enabled: !!announcementId,
  })

  const reactMutation = useMutation({
    mutationFn: (emoji: string) => announcementsApi.toggleReaction(announcementId, emoji),
    onSuccess: (updated) => {
      queryClient.setQueryData(['announcement', announcementId], updated)
      setShowEmojiPicker(false)
    },
  })

  const { data: reactions = [], isLoading: reactionsLoading } = useQuery({
    queryKey: ['announcement', announcementId, 'reactions'],
    queryFn: () => announcementsApi.getReactions(announcementId),
    enabled: showReactionsModal && !!announcementId,
  })

  const deleteMutation = useMutation({
    mutationFn: () => announcementsApi.delete(announcementId),
    onSuccess: () => {
      toast.success('Announcement deleted.')
      navigate(paths.announcements)
    },
  })

  const archiveMutation = useMutation({
    mutationFn: () => ann?.active
      ? announcementsApi.deactivate(announcementId)
      : announcementsApi.activate(announcementId),
    onSuccess: (updated) => {
      queryClient.setQueryData(['announcement', announcementId], updated)
      queryClient.invalidateQueries({ queryKey: ['announcements', 'browse'] })
      toast.success(updated.active ? 'Announcement restored.' : 'Announcement archived.')
    },
  })

  if (isLoading) return (
    <div className="mx-auto max-w-2xl space-y-6 animate-[page-enter_0.3s_ease-out]">
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton h-10 w-3/4 rounded" />
      <div className="skeleton h-48 w-full rounded-2xl" />
      <div className="skeleton h-24 w-full rounded-2xl" />
    </div>
  )

  if (!ann) return (
    <div className="flex flex-col items-center gap-4 py-20">
      <p className="text-6xl">📭</p>
      <p className="text-lg font-bold text-foreground">Announcement not found</p>
      <Link to={paths.announcements} className="text-sm font-semibold text-primary hover:underline">
        ← Back to announcements
      </Link>
    </div>
  )

  const cfg = PRIORITY_CONFIG[ann.priority] ?? PRIORITY_CONFIG.GENERAL
  const date = new Date(ann.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Manila' })
  const time = new Date(ann.createdAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' })
  const isArchived = !ann.active || (ann.expiresAt != null && new Date(ann.expiresAt) < new Date())

  return (
    <div className="mx-auto max-w-2xl animate-[page-enter_0.3s_ease-out]">

      {/* Back link + admin actions */}
      <div className="mb-5 flex items-center justify-between gap-2">
        <Link
          to={paths.announcements}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 2L4 7l5 5" />
          </svg>
          Back to Announcements
        </Link>

        {canManage && (
          <div className="flex items-center gap-2">
            <Link
              to={editAnnouncementPath(announcementId)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                isDark ? 'border-white/10 text-foreground hover:bg-white/5' : 'border-border text-foreground hover:bg-surface-muted',
              )}
            >
              Edit
            </Link>
            <button
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                ann.active
                  ? 'border-amber-300/40 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20'
                  : 'border-emerald-300/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20',
              )}
            >
              {ann.active ? 'Archive' : 'Restore'}
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteMutation.isPending}
                className="rounded-lg border border-red-300/40 px-3 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger/5"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Article */}
      <article
        className={cn(
          'overflow-hidden rounded-2xl border',
          isDark ? 'border-white/8 bg-[#1a1d24]' : 'border-border bg-white',
          isArchived && 'opacity-75',
        )}
      >
        {/* Priority accent bar */}
        <div className={cn('h-1.5 w-full', cfg.bar)} />

        {/* Photo */}
        {ann.imageUrl && (
          <div className="aspect-[21/9] w-full overflow-hidden bg-surface-muted">
            <img src={ann.imageUrl} alt={ann.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="px-6 py-6">
          {/* Meta */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold', cfg.badge)}>
              <span>{cfg.icon}</span>{cfg.label}
            </span>
            {isArchived && (
              <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                Archived
              </span>
            )}
            <time className="ml-auto text-xs text-muted-foreground">
              {date} at {time}
            </time>
          </div>

          {/* Title */}
          <h1 className={cn('text-2xl font-black leading-tight sm:text-3xl', isDark ? 'text-white' : 'text-foreground')}>
            {ann.title}
          </h1>

          {/* Body */}
          <p className={cn('mt-4 text-sm leading-relaxed whitespace-pre-wrap', isDark ? 'text-white/80' : 'text-muted-foreground')}>
            {ann.body}
          </p>
        </div>

        {/* Reactions footer */}
        <div className={cn(
          'flex items-center justify-between border-t px-6 py-4',
          isDark ? 'border-white/8' : 'border-border',
        )}>
          <div className="flex items-center gap-3">
            {/* Current reaction / react button */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker((v) => !v)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition-all hover:-translate-y-0.5',
                  ann.userReaction
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : isDark
                      ? 'border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground'
                      : 'border-border bg-white text-muted-foreground hover:text-foreground hover:shadow-sm',
                )}
              >
                {ann.userReaction ?? '👍'}
                <span className="text-xs">{ann.reactionCount > 0 ? ann.reactionCount : 'React'}</span>
              </button>

              {showEmojiPicker && (
                <div
                  className={cn(
                    'absolute bottom-full left-0 mb-2 flex gap-1 rounded-2xl border px-3 py-2 shadow-xl',
                    isDark ? 'border-white/10 bg-[#1a1d24]' : 'border-border bg-white',
                  )}
                >
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => reactMutation.mutate(emoji)}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full text-xl transition-all hover:scale-125',
                        ann.userReaction === emoji && 'bg-primary/10',
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {ann.reactionCount > 0 && (
              <button
                onClick={() => setShowReactionsModal(true)}
                className="text-xs text-muted-foreground transition-colors hover:text-primary hover:underline"
              >
                {ann.reactionCount} reaction{ann.reactionCount !== 1 ? 's' : ''} — see who reacted
              </button>
            )}
          </div>

          {ann.expiresAt && (
            <span className="text-[11px] text-muted-foreground">
              Expires {new Date(ann.expiresAt).toLocaleDateString('en-PH')}
            </span>
          )}
        </div>
      </article>

      <ReactionsModal
        isOpen={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
        reactions={reactions}
        isLoading={reactionsLoading}
      />

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(4,7,18,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={() => setShowDeleteConfirm(false)}
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
                <button onClick={() => setShowDeleteConfirm(false)} className={cn('flex-1 rounded-xl border px-4 py-2.5 text-sm font-bold', isDark ? 'border-white/12 text-muted-foreground' : 'border-border text-muted-foreground')}>Cancel</button>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="flex-1 rounded-xl bg-danger px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
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
