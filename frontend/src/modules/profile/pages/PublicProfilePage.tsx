import { Navigate, useParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Alert, Card } from '@/shared/components/ui'
import { toApiError } from '@/shared/lib/apiClient'
import { paths } from '@/shared/routes/paths'
import { useAuthStore } from '@/shared/store/authStore'
import { usePublicProfile, useToggleFollow } from '../hooks/useProfile'
import { ProfileHeader } from '../components/ProfileHeader'
import { FollowButton } from '../components/FollowButton'
import { messagesApi } from '@/modules/messages/services/messagesApi'

export function PublicProfilePage() {
  const { userId = '' } = useParams<{ userId: string }>()
  const currentUserId = useAuthStore((state) => state.user?.id)
  const profileQuery = usePublicProfile(userId)
  const toggleFollow = useToggleFollow(userId)
  const navigate = useNavigate()

  const startConversation = useMutation({
    mutationFn: () => messagesApi.getOrCreate(userId),
    onSuccess: (conv) => navigate(paths.messages, { state: { conversationId: conv.id } }),
  })

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
  const detailsHidden = profile.isPrivate && !profile.isFollowing && !profile.isFollowPending

  return (
    <div className="animate-[page-enter_0.3s_ease-out]">
      <ProfileHeader
        name={profile.fullName}
        avatarUrl={profile.avatarUrl}
        course={profile.course}
        bio={profile.bio}
        interests={profile.interests}
        followerCount={profile.followerCount}
        followingCount={profile.followingCount}
        role={profile.role}
        detailsHidden={detailsHidden}
        actions={
          <div className="flex items-center gap-2">
            <FollowButton
              isFollowing={profile.isFollowing}
              isFollowPending={profile.isFollowPending}
              isPending={toggleFollow.isPending}
              onClick={() => !profile.isFollowPending && toggleFollow.mutate(profile.isFollowing)}
            />
            <button
              onClick={() => startConversation.mutate()}
              disabled={startConversation.isPending}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground hover:bg-surface-muted disabled:opacity-60"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              {startConversation.isPending ? '…' : 'Message'}
            </button>
          </div>
        }
      />
      {profile.isPrivate && !profile.isFollowing && !profile.isFollowPending && (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-3xl mb-2">🔒</p>
          <p className="font-bold text-foreground">This profile is private</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Follow this user to see their posts and activity.
          </p>
        </div>
      )}
      {profile.isFollowPending && (
        <div className="mt-6 rounded-2xl border border-amber-300/30 bg-amber-50 dark:bg-amber-900/10 p-4 text-center">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            ⏳ Follow request sent — waiting for approval
          </p>
        </div>
      )}
    </div>
  )
}
