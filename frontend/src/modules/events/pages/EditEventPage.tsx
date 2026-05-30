import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '@/shared/components/ui'
import { eventDetailPath } from '@/shared/routes/paths'
import { useEvent, useUpdateEvent } from '../hooks/useEvents'
import { EventForm } from '../components/EventForm'
import { useLeaveGuard } from '@/shared/hooks/useLeaveGuard'
import type { EventFormValues } from '../schemas'
import type { UpdateEventData } from '../types'

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  return iso.slice(0, 16)
}

export function EditEventPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { data: event, isLoading, isError } = useEvent(eventId!)
  const updateEvent = useUpdateEvent(eventId!)
  const [serverError, setServerError] = useState<string | undefined>()
  const [isDirty, setIsDirty] = useState(false)
  useLeaveGuard(isDirty)

  if (isLoading) return (
    <div className="mx-auto max-w-2xl space-y-5 animate-[page-enter_0.3s_ease-out]">
      <div className="skeleton h-6 w-32 rounded" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
  if (isError || !event) return <Alert variant="error">Event not found.</Alert>

  const defaultValues: EventFormValues = {
    title: event.title,
    description: event.description ?? '',
    category: event.category,
    location: event.location,
    startTime: toDatetimeLocal(event.startTime),
    endTime: toDatetimeLocal(event.endTime),
    coverImageUrl: event.coverImageUrl ?? '',
    capacityStr: event.capacity != null ? String(event.capacity) : '',
  }

  const handleSubmit = (data: UpdateEventData) => {
    setServerError(undefined)
    updateEvent.mutate(data, {
      onSuccess: () => {
        setIsDirty(false)
        navigate(eventDetailPath(eventId!))
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        setServerError(msg ?? 'Failed to update event.')
      },
    })
  }

  return (
    <div
      className="mx-auto max-w-2xl animate-[page-enter_0.3s_ease-out]"
      onInput={() => setIsDirty(true)}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Edit Event</h1>
      </div>
      <EventForm
        defaultValues={defaultValues}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
        isSubmitting={updateEvent.isPending}
        serverError={serverError}
        onCancel={() => navigate(eventDetailPath(eventId!))}
      />
    </div>
  )
}
