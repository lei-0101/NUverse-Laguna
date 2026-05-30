import { Button } from '@/shared/components/ui'

interface FollowButtonProps {
  isFollowing: boolean
  isPending: boolean
  onClick: () => void
}

export function FollowButton({ isFollowing, isPending, onClick }: FollowButtonProps) {
  return (
    <Button
      variant={isFollowing ? 'secondary' : 'primary'}
      onClick={onClick}
      isLoading={isPending}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  )
}
