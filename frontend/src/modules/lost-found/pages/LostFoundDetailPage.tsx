import { useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lostFoundApi } from '../services/lostFoundApi'
import { useAuthStore } from '@/shared/store/authStore'
import { useThemeStore } from '@/shared/store/themeStore'
import { cn } from '@/shared/lib/cn'
import { paths } from '@/shared/routes/paths'
import { toast } from '@/shared/store/toastStore'
import { ReactionsModal } from '@/shared/components/ReactionsModal'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import type { LostFoundComment } from '../types'

const REACTION_EMOJIS = ['👍', '❤️', '😮', '🙏', '🎉']

const TYPE_CONFIG = {
  LOST:  { label: 'LOST',  bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', bar: 'bg-amber-500' },
  FOUND: { label: 'FOUND', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
}

export function LostFoundDetailPage() {
  const { itemId = '' } = useParams()
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showReactionsModal, setShowReactionsModal] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showDeletePostConfirm, setShowDeletePostConfirm] = useState(false)
  const [showAdminDeleteConfirm, setShowAdminDeleteConfirm] = useState(false)
  const [deleteCommentTarget, setDeleteCommentTarget] = useState<string | null>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  const { data: item, isLoading } = useQuery({
    queryKey: ['lost-found', itemId],
    queryFn: () => lostFoundApi.getById(itemId),
    enabled: !!itemId,
  })

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['lost-found', itemId, 'comments'],
    queryFn: () => lostFoundApi.getComments(itemId),
    enabled: !!itemId,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['lost-found', itemId] })
    queryClient.invalidateQueries({ queryKey: ['lost-found'] })
  }

  const reactMutation = useMutation({
    mutationFn: (emoji: string) => lostFoundApi.toggleReaction(itemId, emoji),
    onSuccess: () => { invalidate(); setShowEmojiPicker(false) },
  })

  const resolveMutation = useMutation({
    mutationFn: () => lostFoundApi.resolve(itemId),
    onSuccess: () => { invalidate(); toast.success('Item marked as resolved!') },
  })

  const deleteMutation = useMutation({
    mutationFn: () => lostFoundApi.delete(itemId),
    onSuccess: () => { toast.success('Post deleted.'); navigate(paths.lostFound) },
  })

  const addCommentMutation = useMutation({
    mutationFn: (body: string) => lostFoundApi.addComment(itemId, body),
    onSuccess: () => {
      setCommentText('')
      queryClient.invalidateQueries({ queryKey: ['lost-found', itemId, 'comments'] })
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => lostFoundApi.deleteComment(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lost-found', itemId, 'comments'] }),
  })

  const adminDeleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => lostFoundApi.adminDeleteComment(commentId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['lost-found', itemId, 'comments'] }); toast.success('Comment deleted.') },
  })

  const adminDeletePostMutation = useMutation({
    mutationFn: () => lostFoundApi.adminDelete(itemId),
    onSuccess: () => { toast.success('Post permanently deleted.'); navigate(paths.lostFound) },
  })

  const { data: reactions = [], isLoading: reactionsLoading } = useQuery({
    queryKey: ['lost-found', itemId, 'reactions'],
    queryFn: () => lostFoundApi.getReactions(itemId),
    enabled: showReactionsModal && !!itemId,
  })

  if (isLoading) return (
    <div className="mx-auto max-w-2xl space-y-6 animate-[page-enter_0.3s_ease-out]">
      <div className="skeleton h-5 w-32 rounded" />
      <div className="skeleton h-10 w-3/4 rounded" />
      <div className="skeleton h-48 rounded-2xl" />
    </div>
  )

  if (!item) return (
    <div className="flex flex-col items-center gap-4 py-20">
      <p className="text-5xl">🔍</p>
      <p className="text-lg font-bold text-foreground">Post not found</p>
      <Link to={paths.lostFound} className="text-sm font-semibold text-primary hover:underline">
        ← Back to Lost & Found
      </Link>
    </div>
  )

  const isOwner = user?.id === item.reporterId
  const isAdmin = user?.role === 'ROLE_ADMIN'
  const isResolved = item.status === 'RESOLVED'
  const cfg = TYPE_CONFIG[item.type]
  const date = new Date(item.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Manila' })

  return (
    <div className="mx-auto max-w-2xl animate-[page-enter_0.3s_ease-out]">
      {/* Back + actions */}
      <div className="mb-5 flex items-center justify-between gap-2">
        <Link
          to={paths.lostFound}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 2L4 7l5 5" /></svg>
          Back to Lost & Found
        </Link>

        <div className="flex items-center gap-2">
          {isOwner && !isResolved && (
            <>
              <Link
                to={`${paths.lostFound}/${itemId}/edit`}
                className={cn('rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors', isDark ? 'border-white/10 text-foreground hover:bg-white/5' : 'border-border text-foreground hover:bg-surface-muted')}
              >
                Edit
              </Link>
              <button
                onClick={() => resolveMutation.mutate()}
                disabled={resolveMutation.isPending}
                className="rounded-lg border border-emerald-300/40 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => setShowDeletePostConfirm(true)}
                className="rounded-lg border border-red-300/30 px-3 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger/5"
              >
                Delete
              </button>
            </>
          )}
          {isAdmin && !isOwner && (
            <button
              onClick={() => setShowAdminDeleteConfirm(true)}
              className="rounded-lg border border-red-300/30 px-3 py-1.5 text-xs font-bold text-danger transition-colors hover:bg-danger/5"
            >
              Delete (Admin)
            </button>
          )}
        </div>
      </div>

      {/* Post card */}
      <article className={cn(
        'overflow-hidden rounded-2xl border',
        isDark ? 'border-white/8 bg-[#1a1d24]' : 'border-border bg-white',
      )}>
        {/* Type bar */}
        <div className={cn('h-1.5 w-full', cfg.bar)} />

        {/* Photo */}
        {item.imageUrl && (
          <div className="aspect-[16/9] w-full overflow-hidden bg-surface-muted">
            <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="px-6 py-5">
          {/* Meta */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wider', cfg.bg, cfg.text)}>
              {cfg.label}
            </span>
            {isResolved && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                RESOLVED
              </span>
            )}
            <time className="ml-auto text-xs text-muted-foreground">{date}</time>
          </div>

          <h1 className={cn('text-2xl font-black leading-tight', isDark ? 'text-white' : 'text-foreground')}>
            {item.title}
          </h1>

          <p className={cn('mt-3 text-sm leading-relaxed whitespace-pre-wrap', isDark ? 'text-white/80' : 'text-muted-foreground')}>
            {item.description}
          </p>

          {/* Details grid */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className={cn('rounded-xl p-3', isDark ? 'bg-white/[0.04]' : 'bg-surface-muted/60')}>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{item.location}</p>
            </div>
            <div className={cn('rounded-xl p-3', isDark ? 'bg-white/[0.04]' : 'bg-surface-muted/60')}>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{new Date(item.itemDate).toLocaleDateString('en-PH')}</p>
            </div>
            <div className={cn('rounded-xl p-3', isDark ? 'bg-white/[0.04]' : 'bg-surface-muted/60')}>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Posted by</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{item.reporterName}</p>
            </div>
            {item.contact && (
              <div className={cn('col-span-2 rounded-xl p-3 sm:col-span-3', isDark ? 'bg-white/[0.04]' : 'bg-surface-muted/60')}>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{item.contact}</p>
              </div>
            )}
          </div>

          {/* Reactions */}
          <div className={cn('mt-4 flex items-center gap-3 border-t pt-4', isDark ? 'border-white/8' : 'border-border')}>
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker((v) => !v)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition-all hover:-translate-y-0.5',
                  item.userReaction
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : isDark
                      ? 'border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground'
                      : 'border-border bg-white text-muted-foreground hover:text-foreground',
                )}
              >
                {item.userReaction ?? '👍'}
                {item.reactionCount > 0 && <span className="text-xs">{item.reactionCount}</span>}
              </button>

              {showEmojiPicker && (
                <div className={cn(
                  'absolute bottom-full left-0 mb-2 flex gap-1 rounded-2xl border px-3 py-2 shadow-xl z-10',
                  isDark ? 'border-white/10 bg-[#1a1d24]' : 'border-border bg-white',
                )}>
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => reactMutation.mutate(emoji)}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full text-xl transition-all hover:scale-125',
                        item.userReaction === emoji && 'bg-primary/10',
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {item.reactionCount > 0 && (
              <button
                onClick={() => setShowReactionsModal(true)}
                className="text-xs text-muted-foreground transition-colors hover:text-primary hover:underline"
              >
                {item.reactionCount} reaction{item.reactionCount !== 1 ? 's' : ''} — see who reacted
              </button>
            )}
            <span className="ml-auto text-xs text-muted-foreground">{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </article>

      {/* Comments */}
      <div className="mt-4 space-y-4">
        <h2 className="text-sm font-bold text-foreground">Comments</h2>

        {/* Add comment */}
        {user && (
          <div className={cn('rounded-2xl border p-4', isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface')}>
            <textarea
              ref={commentInputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              maxLength={1000}
              className={cn(
                'w-full resize-none rounded-xl border bg-transparent p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                isDark ? 'border-white/10' : 'border-border',
              )}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{commentText.length}/1000</span>
              <button
                onClick={() => { if (commentText.trim()) addCommentMutation.mutate(commentText.trim()) }}
                disabled={!commentText.trim() || addCommentMutation.isPending}
                className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-40"
              >
                {addCommentMutation.isPending ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        )}

        {/* Comment list */}
        {commentsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className={cn('h-16 animate-pulse rounded-2xl', isDark ? 'bg-white/5' : 'bg-border/30')} />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment: LostFoundComment) => (
              <div
                key={comment.id}
                className={cn('rounded-2xl border p-4', isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-foreground">{comment.authorName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {user?.id === comment.authorId && (
                      <button
                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                        className="text-xs text-muted-foreground transition-colors hover:text-danger"
                      >
                        Delete
                      </button>
                    )}
                    {isAdmin && user?.id !== comment.authorId && (
                      <button
                        onClick={() => setDeleteCommentTarget(comment.id)}
                        className="text-xs font-semibold text-danger transition-colors hover:opacity-70"
                      >
                        Delete (Admin)
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-foreground leading-relaxed">{comment.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReactionsModal
        isOpen={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
        reactions={reactions}
        isLoading={reactionsLoading}
      />

      <ConfirmModal
        isOpen={showDeletePostConfirm}
        onClose={() => setShowDeletePostConfirm(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete this post?"
        message="Your Lost & Found post will be permanently removed."
        confirmLabel="Delete post"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      <ConfirmModal
        isOpen={showAdminDeleteConfirm}
        onClose={() => setShowAdminDeleteConfirm(false)}
        onConfirm={() => adminDeletePostMutation.mutate()}
        title="Admin — delete post?"
        message="This post will be permanently removed. This action cannot be undone."
        confirmLabel="Delete permanently"
        variant="danger"
        isLoading={adminDeletePostMutation.isPending}
      />

      <ConfirmModal
        isOpen={deleteCommentTarget !== null}
        onClose={() => setDeleteCommentTarget(null)}
        onConfirm={() => {
          if (deleteCommentTarget) adminDeleteCommentMutation.mutate(deleteCommentTarget, {
            onSettled: () => setDeleteCommentTarget(null),
          })
        }}
        title="Delete this comment?"
        message="This comment will be permanently removed by admin action."
        confirmLabel="Delete comment"
        variant="danger"
        isLoading={adminDeleteCommentMutation.isPending}
      />
    </div>
  )
}
