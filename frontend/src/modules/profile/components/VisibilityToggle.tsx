import { Button } from '@/shared/components/ui'
import type { ProfileVisibility } from '../types'

interface VisibilityToggleProps {
  visibility: ProfileVisibility
  onChange: (next: ProfileVisibility) => void
  isPending: boolean
}

/** Toggles the profile between PUBLIC and PRIVATE visibility. */
export function VisibilityToggle({ visibility, onChange, isPending }: VisibilityToggleProps) {
  const isPublic = visibility === 'PUBLIC'

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">
          Profile visibility: {isPublic ? 'Public' : 'Private'}
        </p>
        <p className="text-sm text-muted-foreground">
          {isPublic
            ? 'Anyone on campus can see your full profile.'
            : 'Only you and your followers can see your details.'}
        </p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        isLoading={isPending}
        onClick={() => onChange(isPublic ? 'PRIVATE' : 'PUBLIC')}
      >
        Make {isPublic ? 'Private' : 'Public'}
      </Button>
    </div>
  )
}
