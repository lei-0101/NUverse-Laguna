import type { UpdatePrivacyPayload } from '../types'

interface PrivacyTogglesProps {
  hideMarketplaceActivity: boolean
  hideChibiShowcase: boolean
  onChange: (next: UpdatePrivacyPayload) => void
  isPending: boolean
}

/** Privacy switches — marketplace activity and Chibi showcase toggles removed per product decision. */
export function PrivacyToggles(_props: PrivacyTogglesProps) {
  return null
}
