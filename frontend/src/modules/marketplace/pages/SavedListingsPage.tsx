import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui'
import { paths } from '@/shared/routes/paths'
import { useSavedListings } from '../hooks/useMarketplace'
import { ListingGrid } from '../components/ListingGrid'

/** Listings the user has saved for later. */
export function SavedListingsPage() {
  const [page, setPage] = useState(0)
  const navigate = useNavigate()
  const { data, isLoading, isError } = useSavedListings(page)

  return (
    <div className="space-y-6 animate-[page-enter_0.3s_ease-out]">
      <h1 className="text-2xl font-semibold text-foreground">Saved listings</h1>

      <ListingGrid
        listings={data?.content}
        isLoading={isLoading}
        isError={isError}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        emptyTitle="No saved listings"
        emptyDescription="Tap the save button on any listing to keep it here."
        emptyAction={<Button onClick={() => navigate(paths.marketplace)}>Browse marketplace</Button>}
      />
    </div>
  )
}
