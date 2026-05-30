import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Modal } from '@/shared/components/ui'
import { useAuthStore } from '@/shared/store/authStore'
import { paths, editEventPath } from '@/shared/routes/paths'
import { useEvent, usePublishEvent, useCancelEvent, useDeleteEvent } from '../hooks/useEvents'
import { EventCategoryBadge } from '../components/EventCategoryBadge'
import { EventStatusBadge } from '../components/EventStatusBadge'
import { RsvpButton } from '../components/RsvpButton'
import { toast } from '@/shared/store/toastStore'

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
    </div>
  )
}
