import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths, eventDetailPath } from '@/shared/routes/paths'
import { useCreateEvent } from '../hooks/useEvents'
import { EventForm } from '../components/EventForm'
import { useLeaveGuard } from '@/shared/hooks/useLeaveGuard'
import type { EventFormValues } from '../schemas'
import type { CreateEventData } from '../types'

export function CreateEventPage() {
  const navigate = useNavigate()
  const createEvent = useCreateEvent()
  const [serverError, setServerError] = useState<string | undefined>()
  const [isDirty, setIsDirty] = useState(false)
  useLeaveGuard(isDirty)

  const defaultValues: EventFormValues = {
    title: '',
    description: '',
    category: '' as EventFormValues['category'],
    location: '',
    startTime: '',
    endTime: '',
    coverImageUrl: '',
    capacityStr: '',
  }

  const handleSubmit = (data: CreateEventData) => {
    setServerError(undefined)
    createEvent.mutate(data, {
      onSuccess: (event) => {
        setIsDirty(false)
        navigate(eventDetailPath(event.id))
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        setServerError(msg ?? 'Failed to create event. Please try again.')
      },
    })
  }

  return (
    <div
      className="mx-auto max-w-2xl animate-[page-enter_0.3s_ease-out]"
      onInput={() => setIsDirty(true)}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Create Event</h1>
        <p className="text-sm text-muted-foreground">
          Events start as drafts. Publish them when ready.
        </p>
      </div>
      <EventForm
        defaultValues={defaultValues}
        submitLabel="Create as Draft"
        onSubmit={handleSubmit}
        isSubmitting={createEvent.isPending}
        serverError={serverError}
        onCancel={() => navigate(paths.events)}
      />
    </div>
  )
}
