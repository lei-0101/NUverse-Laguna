import { useState } from 'react'
import { Button } from '@/shared/components/ui'
import { Confetti } from '@/shared/components/Confetti'
import { useRsvp, useCancelRsvp } from '../hooks/useEvents'

interface Props {
  eventId: string
  isRsvpd: boolean
  rsvpOpen: boolean
}

export function RsvpButton({ eventId, isRsvpd, rsvpOpen }: Props) {
  const rsvp = useRsvp()
  const cancelRsvp = useCancelRsvp()
  const [showConfetti, setShowConfetti] = useState(false)

  if (!rsvpOpen && !isRsvpd) {
    return (
      <Button variant="secondary" disabled className="w-full sm:w-auto">
        RSVP Closed
      </Button>
    )
  }

  if (isRsvpd) {
    return (
      <Button
        variant="danger"
        onClick={() => cancelRsvp.mutate(eventId)}
        isLoading={cancelRsvp.isPending}
        className="w-full sm:w-auto"
      >
        Cancel RSVP
      </Button>
    )
  }

  return (
    <>
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
      <Button
        variant="primary"
        onClick={() =>
          rsvp.mutate(eventId, {
            onSuccess: () => setShowConfetti(true),
          })
        }
        isLoading={rsvp.isPending}
        disabled={!rsvpOpen}
        className="w-full sm:w-auto"
      >
        RSVP
      </Button>
    </>
  )
}
