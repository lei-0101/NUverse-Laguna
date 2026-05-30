import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui'
import { paths } from '@/shared/routes/paths'
import { useMyListings } from '../hooks/useMarketplace'
import { ListingGrid } from '../components/ListingGrid'

/** The signed-in user's own listings, across every status. */
export function MyListingsPage() {
  const [page, setPage] = useState(0)
  const navigate = useNavigate()
  const { data, isLoading, isError } = useMyListings(page)

  return (
    <div className="space-y-6 animate-[page-enter_0.3s_ease-out]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-foreground">My listings</h1>
        <Button onClick={() => navigate(paths.marketplaceNew)}>+ New listing</Button>
      </div>

      <ListingGrid
        listings={data?.content}
        isLoading={isLoading}
        isError={isError}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        emptyTitle="You haven't posted anything yet"
        emptyDescription="Create your first listing to start selling on campus."
        emptyAction={<Button onClick={() => navigate(paths.marketplaceNew)}>+ New listing</Button>}
      />
    </div>
  )
}
