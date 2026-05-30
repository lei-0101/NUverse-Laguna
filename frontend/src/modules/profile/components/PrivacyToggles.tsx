import type { UpdatePrivacyPayload } from '../types'

interface PrivacyTogglesProps {
  hideMarketplaceActivity: boolean
  hideChibiShowcase: boolean
  onChange: (next: UpdatePrivacyPayload) => void
  isPending: boolean
}

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  disabled: boolean
  onToggle: (checked: boolean) => void
}

function ToggleRow({ label, description, checked, disabled, onToggle }: ToggleRowProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onToggle(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-border accent-primary"
      />
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="block text-sm text-muted-foreground">{description}</span>
      </span>
    </label>
  )
}

/** Two independent privacy switches persisted together via the parent. */
export function PrivacyToggles({
  hideMarketplaceActivity,
  hideChibiShowcase,
  onChange,
  isPending,
}: PrivacyTogglesProps) {
  return (
    <div className="flex flex-col gap-4">
      <ToggleRow
        label="Hide marketplace activity"
        description="Keep your listings off your public profile."
        checked={hideMarketplaceActivity}
        disabled={isPending}
        onToggle={(checked) =>
          onChange({ hideMarketplaceActivity: checked, hideChibiShowcase })
        }
      />
      <ToggleRow
        label="Hide Bulldog Chibi showcase"
        description="Keep your Chibi off your public profile."
        checked={hideChibiShowcase}
        disabled={isPending}
        onToggle={(checked) =>
          onChange({ hideMarketplaceActivity, hideChibiShowcase: checked })
        }
      />
    </div>
  )
}
