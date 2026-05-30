import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toApiError } from '@/shared/lib/apiClient'
import { marketplaceListingPath, paths } from '@/shared/routes/paths'
import { useCreateListing } from '../hooks/useMarketplace'
import { ListingForm } from '../components/ListingForm'
import { useLeaveGuard } from '@/shared/hooks/useLeaveGuard'
import type { ListingFormValues } from '../schemas'
import type { ListingPayload } from '../types'

const EMPTY_FORM: ListingFormValues = {
  title: '',
  description: '',
  price: '',
  category: 'BOOKS',
  condition: 'GOOD',
}

/** Create a new marketplace listing. */
export function CreateListingPage() {
  const navigate = useNavigate()
  const create = useCreateListing()
  const [serverError, setServerError] = useState<string>()
  const [isDirty, setIsDirty] = useState(false)
  useLeaveGuard(isDirty)

  const handleSubmit = (payload: ListingPayload) => {
    setServerError(undefined)
    create.mutate(payload, {
      onSuccess: (listing) => {
        setIsDirty(false)
        navigate(marketplaceListingPath(listing.id))
      },
      onError: (error) => setServerError(toApiError(error).message),
    })
  }

  return (
    <div
      className="mx-auto max-w-3xl space-y-6 animate-[page-enter_0.3s_ease-out]"
      onInput={() => setIsDirty(true)}
    >
      <h1 className="text-2xl font-semibold text-foreground">New listing</h1>
      <ListingForm
        defaultValues={EMPTY_FORM}
        initialImages={[]}
        submitLabel="Post listing"
        onSubmit={handleSubmit}
        isSubmitting={create.isPending}
        serverError={serverError}
        onCancel={() => navigate(paths.marketplace)}
      />
    </div>
  )
}
