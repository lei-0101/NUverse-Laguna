import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader, Modal, Pagination } from '@/shared/components/ui'
import { toApiError } from '@/shared/lib/apiClient'
import { Alert } from '@/shared/components/ui'
import { profileApi } from '../services/profileApi'
import { profileKeys } from '../hooks/useProfile'
import { FollowList } from './FollowList'

interface FollowModalProps {
  type: 'followers' | 'following'
  isOpen: boolean
  onClose: () => void
}

/** Paginated follower/following list shown in a modal. Fetches only when open. */
export function FollowModal({ type, isOpen, onClose }: FollowModalProps) {
  const [page, setPage] = useState(0)

  useEffect(() => {
    if (!isOpen) setPage(0)
  }, [isOpen])

  const query = useQuery({
    queryKey: type === 'followers' ? profileKeys.followers(page) : profileKeys.following(page),
    queryFn: () => (type === 'followers' ? profileApi.getFollowers(page) : profileApi.getFollowing(page)),
    enabled: isOpen,
  })

  const title = type === 'followers' ? 'Followers' : 'Following'
  const emptyLabel = type === 'followers' ? 'No followers yet' : 'Not following anyone yet'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {query.isPending && <Loader label={`Loading ${title.toLowerCase()}…`} />}
      {query.isError && <Alert variant="error">{toApiError(query.error).message}</Alert>}
      {query.isSuccess && (
        <div className="flex flex-col gap-4">
          <FollowList items={query.data.content} emptyLabel={emptyLabel} onNavigate={onClose} />
          <Pagination
            page={query.data.number}
            totalPages={query.data.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </Modal>
  )
}
