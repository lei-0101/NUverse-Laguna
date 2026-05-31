import { Button } from '@/shared/components/ui'

interface FollowButtonProps {
  isFollowing: boolean
  isFollowPending?: boolean
  isPending: boolean
  onClick: () => void
}

export function FollowButton({ isFollowing, isFollowPending, isPending, onClick }: FollowButtonProps) {
  const label = isFollowing ? 'Following' : isFollowPending ? 'Pending…' : 'Follow'
  return (
    <Button
      variant={isFollowing || isFollowPending ? 'secondary' : 'primary'}
      onClick={onClick}
      isLoading={isPending}
      disabled={isFollowPending}
    >
      {label}
    </Button>
  )
}
