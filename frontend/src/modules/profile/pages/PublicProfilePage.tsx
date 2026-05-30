import { Navigate, useParams } from 'react-router-dom'
import { Alert, Card } from '@/shared/components/ui'
import { toApiError } from '@/shared/lib/apiClient'
import { paths } from '@/shared/routes/paths'
import { useAuthStore } from '@/shared/store/authStore'
import { usePublicProfile, useToggleFollow } from '../hooks/useProfile'
import { ProfileHeader } from '../components/ProfileHeader'
import { FollowButton } from '../components/FollowButton'

export function PublicProfilePage() {
  const { userId = '' } = useParams<{ userId: string }>()
  const currentUserId = useAuthStore((state) => state.user?.id)
  const profileQuery = usePublicProfile(userId)
  const toggleFollow = useToggleFollow(userId)

  // Viewing your own profile via its public URL — send to the editable view.
  if (currentUserId && userId === currentUserId) {
    return <Navigate to={paths.profile} replace />
  }

  if (profileQuery.isPending) return (
    <Card className="p-6 animate-[page-enter_0.3s_ease-out]">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="skeleton h-20 w-20 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-6 w-40 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-4 w-48 rounded" />
          <div className="flex gap-6">
            <div className="skeleton h-4 w-16 rounded" />
            <div className="skeleton h-4 w-16 rounded" />
          </div>
        </div>
        <div className="skeleton h-9 w-24 rounded-lg" />
      </div>
    </Card>
  )
  if (profileQuery.isError) {
    return <Alert variant="error">{toApiError(profileQuery.error).message}</Alert>
  }

  const profile = profileQuery.data
  const detailsHidden = profile.isPrivate && !profile.isFollowing

  return (
    <div className="animate-[page-enter_0.3s_ease-out]">
      <ProfileHeader
        name={profile.fullName}
        avatarUrl={profile.avatarUrl}
        course={profile.course}
        yearLevel={profile.yearLevel}
        bio={profile.bio}
        interests={profile.interests}
        followerCount={profile.followerCount}
        followingCount={profile.followingCount}
        detailsHidden={detailsHidden}
        actions={
          <FollowButton
            isFollowing={profile.isFollowing}
            isPending={toggleFollow.isPending}
            onClick={() => toggleFollow.mutate(profile.isFollowing)}
          />
        }
      />
    </div>
  )
}
