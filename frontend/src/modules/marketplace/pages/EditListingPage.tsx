import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '@/shared/components/ui'
import { toApiError } from '@/shared/lib/apiClient'
import { useAuthStore } from '@/shared/store/authStore'
import { marketplaceListingPath } from '@/shared/routes/paths'
import { useListing, useUpdateListing } from '../hooks/useMarketplace'
import { ListingForm } from '../components/ListingForm'
import { useLeaveGuard } from '@/shared/hooks/useLeaveGuard'
import type { ListingFormValues } from '../schemas'
import type { ListingPayload } from '../types'

/** Edit an existing listing the user owns. */
export function EditListingPage() {
  const { listingId = '' } = useParams()
  const navigate = useNavigate()
  const currentUserId = useAuthStore((state) => state.user?.id)
  const { data: listing, isLoading, isError } = useListing(listingId)
  const update = useUpdateListing(listingId)
  const [serverError, setServerError] = useState<string>()
  const [isDirty, setIsDirty] = useState(false)
  useLeaveGuard(isDirty)

  if (isLoading) return (
    <div className="mx-auto max-w-3xl space-y-5 animate-[page-enter_0.3s_ease-out]">
      <div className="skeleton h-6 w-32 rounded" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
  if (isError || !listing) return <Alert variant="error">This listing could not be loaded.</Alert>
  if (listing.seller.userId !== currentUserId) {
    return <Alert variant="error">You can only edit your own listings.</Alert>
  }

  const defaults: ListingFormValues = {
    title: listing.title,
    description: listing.description,
    price: String(listing.price),
    category: listing.category,
    condition: listing.condition,
  }

  const handleSubmit = (payload: ListingPayload) => {
    setServerError(undefined)
    update.mutate(payload, {
      onSuccess: () => {
        setIsDirty(false)
        navigate(marketplaceListingPath(listingId))
      },
      onError: (error) => setServerError(toApiError(error).message),
    })
  }

  return (
    <div
      className="mx-auto max-w-3xl space-y-6 animate-[page-enter_0.3s_ease-out]"
      onInput={() => setIsDirty(true)}
    >
      <h1 className="text-2xl font-semibold text-foreground">Edit listing</h1>
      <ListingForm
        defaultValues={defaults}
        initialImages={listing.imageUrls}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        isSubmitting={update.isPending}
        serverError={serverError}
        onCancel={() => navigate(marketplaceListingPath(listingId))}
      />
    </div>
  )
}
