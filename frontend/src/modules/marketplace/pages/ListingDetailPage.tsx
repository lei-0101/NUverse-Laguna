import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Alert, Avatar, Button, Card } from '@/shared/components/ui'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import { toApiError } from '@/shared/lib/apiClient'
import { toast } from '@/shared/store/toastStore'
import { useAuthStore } from '@/shared/store/authStore'
import { marketplaceEditPath, paths, userProfilePath } from '@/shared/routes/paths'
import { formatPrice } from '../schemas'
import {
  useListing,
  useMarkAsSold,
  useRemoveListing,
  useReportListing,
  useSuspendListing,
  useToggleSaveListing,
} from '../hooks/useMarketplace'
import { ImageGallery } from '../components/ImageGallery'
import { ReportModal } from '../components/ReportModal'
import { CategoryBadge, ConditionBadge, StatusBadge } from '../components/badges'
import type { ReportFormValues } from '../schemas'
import { messagesApi } from '@/modules/messages/services/messagesApi'

/** Full listing detail with viewer-aware actions (owner, buyer, admin). */
export function ListingDetailPage() {
  const { listingId = '' } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { data: listing, isLoading, isError } = useListing(listingId)

  const toggleSave = useToggleSaveListing(listingId)
  const markSold = useMarkAsSold(listingId)
  const remove = useRemoveListing()
  const suspend = useSuspendListing(listingId)
  const report = useReportListing(listingId)

  const [reportOpen,     setReportOpen]     = useState(false)
  const [reportError,    setReportError]    = useState<string>()
  const [reported,       setReported]       = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const startConvo = useMutation({
    mutationFn: (sellerId: string) => messagesApi.getOrCreate(sellerId),
    onSuccess: (conv) => {
      navigate(paths.messages, { state: { conversationId: conv.id } })
    },
    onError: () => toast.error('Could not open conversation.'),
  })

  if (isLoading) return (
    <div className="space-y-6 animate-[page-enter_0.3s_ease-out]">
      <div className="skeleton h-5 w-32 rounded" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="skeleton aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-7 w-3/4 rounded" />
          <div className="skeleton h-5 w-1/4 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
          <div className="skeleton h-4 w-4/6 rounded" />
          <div className="skeleton h-10 w-1/2 rounded-lg" />
        </div>
      </div>
    </div>
  )
  if (isError || !listing) return <Alert variant="error">This listing could not be loaded.</Alert>

  const isOwner = listing.seller.userId === user?.id
  const isAdmin = user?.role === 'ROLE_ADMIN'

  const handleDelete = () => {
    remove.mutate(listingId, {
      onSuccess: () => navigate(paths.myListings),
      onSettled: () => setShowDeleteConfirm(false),
    })
  }

  const handleReport = (values: ReportFormValues) => {
    setReportError(undefined)
    report.mutate(values, {
      onSuccess: () => {
        setReported(true)
        setReportOpen(false)
      },
      onError: (error) => setReportError(toApiError(error).message),
    })
  }

  return (
    <div className="space-y-6 animate-[page-enter_0.3s_ease-out]">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(paths.marketplace)}>
          ← Back to marketplace
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            toast.success('Link copied to clipboard!')
          }}
        >
          🔗 Copy Link
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ImageGallery images={listing.imageUrls} title={listing.title} />

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={listing.status} />
              <CategoryBadge category={listing.category} />
              <ConditionBadge condition={listing.condition} />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">{listing.title}</h1>
            <p className="text-3xl font-bold text-foreground">{formatPrice(listing.price)}</p>
          </div>

          <Card className="flex items-center gap-3">
            <Avatar src={listing.seller.avatarUrl} name={listing.seller.fullName} />
            <div>
              <p className="text-xs text-muted-foreground">Seller</p>
              <Link
                to={userProfilePath(listing.seller.userId)}
                className="font-medium text-foreground hover:text-primary"
              >
                {listing.seller.fullName}
              </Link>
            </div>
          </Card>

          <div className="whitespace-pre-wrap text-sm text-foreground">{listing.description}</div>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {isOwner ? (
              <>
                <Button onClick={() => navigate(marketplaceEditPath(listingId))}>Edit</Button>
                {listing.status === 'AVAILABLE' && (
                  <Button
                    variant="secondary"
                    isLoading={markSold.isPending}
                    onClick={() => markSold.mutate()}
                  >
                    Mark as sold
                  </Button>
                )}
                <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                  Delete
                </Button>
              </>
            ) : (
              <>
                {listing.status === 'AVAILABLE' && (
                  <Button
                    variant="primary"
                    isLoading={startConvo.isPending}
                    onClick={() => startConvo.mutate(listing.seller.userId)}
                  >
                    Message Seller
                  </Button>
                )}
                <Button
                  variant={listing.isSaved ? 'secondary' : 'secondary'}
                  isLoading={toggleSave.isPending}
                  onClick={() => toggleSave.mutate(listing.isSaved)}
                >
                  {listing.isSaved ? 'Saved ✓' : 'Save'}
                </Button>
                <Button
                  variant="ghost"
                  disabled={reported}
                  onClick={() => setReportOpen(true)}
                >
                  {reported ? 'Reported' : 'Report'}
                </Button>
              </>
            )}
            {isAdmin && !isOwner && listing.status !== 'SUSPENDED' && (
              <Button variant="danger" isLoading={suspend.isPending} onClick={() => suspend.mutate()}>
                Suspend (admin)
              </Button>
            )}
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleReport}
        isSubmitting={report.isPending}
        serverError={reportError}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete this listing?"
        message="Your listing will be permanently removed. Buyers who bookmarked it will no longer see it."
        confirmLabel="Delete listing"
        variant="danger"
        isLoading={remove.isPending}
      />
    </div>
  )
}
