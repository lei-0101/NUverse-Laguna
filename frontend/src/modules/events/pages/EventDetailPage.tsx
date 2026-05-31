import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Modal } from '@/shared/components/ui'
import { useAuthStore } from '@/shared/store/authStore'
import { useThemeStore } from '@/shared/store/themeStore'
import { paths, editEventPath } from '@/shared/routes/paths'
import { useEvent, usePublishEvent, useCancelEvent, useDeleteEvent } from '../hooks/useEvents'
import { EventCategoryBadge } from '../components/EventCategoryBadge'
import { EventStatusBadge } from '../components/EventStatusBadge'
import { RsvpButton } from '../components/RsvpButton'
import { ReactionsModal } from '@/shared/components/ReactionsModal'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import { eventsApi } from '../services/eventsApi'
import { cn } from '@/shared/lib/cn'
import { toast } from '@/shared/store/toastStore'
import type { EventComment } from '../types'

const REACTION_EMOJIS = ['👍', '❤️', '😮', '🙏', '🎉']

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-PH', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data: event, isLoading, isError } = useEvent(eventId!)
  const publishEvent = usePublishEvent()
  const cancelEvent = useCancelEvent()
  const deleteEvent = useDeleteEvent()

  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteCommentTarget, setDeleteCommentTarget] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showReactionsModal, setShowReactionsModal] = useState(false)
  const [showAttendees, setShowAttendees] = useState(false)
  const [commentText, setCommentText] = useState('')
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const qc = useQueryClient()

  const reactMutation = useMutation({
    mutationFn: (emoji: string) => eventsApi.toggleReaction(eventId!, emoji),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['event', eventId] }); setShowEmojiPicker(false) },
  })

  const { data: reactions = [], isLoading: reactionsLoading } = useQuery({
    queryKey: ['event', eventId, 'reactions'],
    queryFn: () => eventsApi.getReactions(eventId!),
    enabled: showReactionsModal && !!eventId,
  })

  const { data: attendees = [] } = useQuery({
    queryKey: ['event', eventId, 'attendees'],
    queryFn: () => eventsApi.getAttendees(eventId!),
    enabled: showAttendees && !!eventId,
  })

  const { data: comments = [] } = useQuery({
    queryKey: ['event', eventId, 'comments'],
    queryFn: () => eventsApi.getComments(eventId!),
    enabled: !!eventId,
  })

  const addCommentMutation = useMutation({
    mutationFn: (body: string) => eventsApi.addComment(eventId!, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['event', eventId, 'comments'] }); setCommentText('') },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => eventsApi.deleteComment(commentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event', eventId, 'comments'] }),
  })

  const adminDeleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => eventsApi.adminDeleteComment(commentId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['event', eventId, 'comments'] }); toast.success('Comment deleted.') },
  })

  if (isLoading) return (
    <div className="mx-auto max-w-3xl space-y-6 animate-[page-enter_0.3s_ease-out]">
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
        <div className="skeleton h-8 w-2/3 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
      </div>
      <div className="skeleton h-52 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="skeleton h-5 w-2/3 rounded" />
        </div>
        <div className="space-y-2">
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="skeleton h-5 w-1/2 rounded" />
        </div>
      </div>
      <div className="skeleton h-10 w-36 rounded-lg" />
    </div>
  )
  if (isError || !event) {
    return <Alert variant="error">Event not found or failed to load.</Alert>
  }

  const isAdmin = user?.role === 'ROLE_ADMIN'
  const isFaculty = user?.role === 'ROLE_FACULTY'
  const isCreator = event.creatorId === user?.id
  const canEdit = (isAdmin || isFaculty) && isCreator
  const canPublish = canEdit && event.status === 'DRAFT'
  const canCancel = isAdmin && event.status !== 'CANCELLED'
  const canDelete = isAdmin && event.status === 'DRAFT'

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-[page-enter_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <EventStatusBadge status={event.status} />
            <EventCategoryBadge category={event.category} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              toast.success('Link copied to clipboard!')
            }}
          >
            🔗 Copy Link
          </Button>
          {canEdit && (
            <Link to={editEventPath(eventId!)}>
              <Button variant="secondary" size="sm">Edit</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Cover image */}
      {event.coverImageUrl && (
        <img
          src={event.coverImageUrl}
          alt={event.title}
          className="w-full rounded-xl object-cover"
          style={{ maxHeight: '320px' }}
        />
      )}

      {/* Meta */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</p>
          <p className="mt-1 text-sm font-medium text-foreground">{event.location}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Starts</p>
          <p className="mt-1 text-sm font-medium text-foreground">{formatDate(event.startTime)}</p>
        </div>
        {event.endTime && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ends</p>
            <p className="mt-1 text-sm font-medium text-foreground">{formatDate(event.endTime)}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Attendance</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {event.rsvpCount} attending
            {event.capacity !== null && ` / ${event.capacity} capacity`}
          </p>
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{event.description}</p>
        </div>
      )}

      {/* RSVP section */}
      {event.status === 'PUBLISHED' && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {event.isRsvpd ? (
              <p className="text-sm font-medium text-success">✓ You&apos;re registered for this event.</p>
            ) : event.rsvpOpen ? (
              <p className="text-sm text-muted-foreground">RSVP to secure your spot.</p>
            ) : (
              <p className="text-sm text-muted-foreground">RSVP is no longer available for this event.</p>
            )}
          </div>
          <RsvpButton eventId={eventId!} isRsvpd={event.isRsvpd} rsvpOpen={event.rsvpOpen} />
        </div>
      )}

      {/* Admin / creator actions */}
      {(canPublish || canCancel || canDelete) && (
        <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-surface-muted p-4">
          <p className="w-full text-xs font-medium text-muted-foreground uppercase tracking-wide">Management</p>
          {canPublish && (
            <Button
              variant="primary"
              size="sm"
              isLoading={publishEvent.isPending}
              onClick={() => publishEvent.mutate(eventId!)}
            >
              Publish Event
            </Button>
          )}
          {canCancel && (
            <Button variant="danger" size="sm" onClick={() => setShowCancelConfirm(true)}>
              Cancel Event
            </Button>
          )}
          {canDelete && (
            <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              Delete Draft
            </Button>
          )}
        </div>
      )}

      {/* Reactions & Attendees */}
      <div className={cn('flex items-center gap-3 rounded-xl border p-4', isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface')}>
        {/* React button */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition-all hover:-translate-y-0.5',
              event.userReaction
                ? 'border-primary/40 bg-primary/10 text-primary'
                : isDark
                  ? 'border-white/10 bg-white/[0.03] text-muted-foreground'
                  : 'border-border bg-white text-muted-foreground',
            )}
          >
            {event.userReaction ?? '👍'}
            {(event.reactionCount ?? 0) > 0 && <span className="text-xs">{event.reactionCount}</span>}
          </button>
          {showEmojiPicker && (
            <div className={cn('absolute bottom-full left-0 mb-2 flex gap-1 rounded-2xl border px-3 py-2 shadow-xl z-20', isDark ? 'border-white/10 bg-[#1a1d24]' : 'border-border bg-white')}>
              {REACTION_EMOJIS.map((emoji) => (
                <button key={emoji} onClick={() => reactMutation.mutate(emoji)}
                  className={cn('flex h-8 w-8 items-center justify-center rounded-full text-lg transition-all hover:scale-125', event.userReaction === emoji && 'bg-primary/10')}>
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        {(event.reactionCount ?? 0) > 0 && (
          <button onClick={() => setShowReactionsModal(true)} className="text-xs text-muted-foreground hover:text-primary hover:underline">
            {event.reactionCount} reaction{event.reactionCount !== 1 ? 's' : ''} — see who reacted
          </button>
        )}
        <div className="ml-auto">
          <button
            onClick={() => setShowAttendees((v) => !v)}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {event.rsvpCount} {event.rsvpCount === 1 ? 'person' : 'people'} attending — view list
          </button>
        </div>
      </div>

      {/* Attendees list */}
      {showAttendees && attendees.length > 0 && (
        <div className={cn('rounded-xl border p-4', isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface')}>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Attendees ({attendees.length})</p>
          <div className="flex flex-wrap gap-2">
            {attendees.map((a) => (
              <span key={a.rsvpId} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {a.rsvpId}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground">Comments ({comments.length})</h2>
        {user && (
          <div className={cn('rounded-2xl border p-4', isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface')}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              rows={2}
              maxLength={1000}
              className={cn('w-full resize-none rounded-xl border bg-transparent p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20', isDark ? 'border-white/10' : 'border-border')}
            />
            <div className="mt-2 flex justify-end">
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
        {comments.map((comment: EventComment) => (
          <div key={comment.id} className={cn('rounded-2xl border p-4', isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface')}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-foreground">{comment.authorName}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' })}</p>
              </div>
              <div className="flex items-center gap-2">
                {user?.id === comment.authorId && (
                  <button onClick={() => deleteCommentMutation.mutate(comment.id)} disabled={deleteCommentMutation.isPending} className="text-xs text-muted-foreground hover:text-danger">Delete</button>
                )}
                {isAdmin && user?.id !== comment.authorId && (
                  <button onClick={() => setDeleteCommentTarget(comment.id)} className="text-xs font-semibold text-danger hover:opacity-70">Delete (Admin)</button>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-foreground leading-relaxed">{comment.body}</p>
          </div>
        ))}
      </div>

      <Link to={paths.events} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        ← Back to events
      </Link>

      {/* Cancel confirm modal */}
      <Modal isOpen={showCancelConfirm} onClose={() => setShowCancelConfirm(false)} title="Cancel Event">
        <p className="text-sm text-muted-foreground">
          Are you sure you want to cancel <strong>{event.title}</strong>? This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowCancelConfirm(false)}>Keep</Button>
          <Button
            variant="danger"
            isLoading={cancelEvent.isPending}
            onClick={() => {
              cancelEvent.mutate(eventId!, { onSuccess: () => setShowCancelConfirm(false) })
            }}
          >
            Cancel Event
          </Button>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Draft">
        <p className="text-sm text-muted-foreground">
          Permanently delete <strong>{event.title}</strong>?
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Keep</Button>
          <Button
            variant="danger"
            isLoading={deleteEvent.isPending}
            onClick={() => {
              deleteEvent.mutate(eventId!, {
                onSuccess: () => navigate(paths.events),
              })
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
      <ReactionsModal
        isOpen={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
        reactions={reactions}
        isLoading={reactionsLoading}
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
