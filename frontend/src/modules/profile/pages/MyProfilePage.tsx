import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button } from '@/shared/components/ui'
import { toApiError } from '@/shared/lib/apiClient'
import { paths } from '@/shared/routes/paths'
import {
  useApproveFollow,
  useChangeVisibility,
  useMyProfile,
  usePendingFollowers,
  useRejectFollow,
  useRemoveAvatar,
  useUploadAvatar,
} from '../hooks/useProfile'
import { ProfileHeader } from '../components/ProfileHeader'
import { AvatarUploader } from '../components/AvatarUploader'
import { VisibilityToggle } from '../components/VisibilityToggle'
import { FollowModal } from '../components/FollowModal'
import { useThemeStore } from '@/shared/store/themeStore'
import { useAuthStore } from '@/shared/store/authStore'
import { cn } from '@/shared/lib/cn'

type OpenModal = 'followers' | 'following' | null

function SectionPanel({
  title,
  description,
  children,
  icon,
}: {
  title: string
  description?: string
  children: React.ReactNode
  icon: React.ReactNode
}) {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border',
        isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface',
      )}
    >
      {/* Panel header */}
      <div
        className="flex items-center gap-3 border-b px-5 py-4"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: 'linear-gradient(135deg, rgba(31,58,138,0.12), rgba(74,110,232,0.12))' }}
        >
          <span className="text-primary">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function PendingFollowersPanel() {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const { data: pending = [], isLoading } = usePendingFollowers()
  const approve = useApproveFollow()
  const reject  = useRejectFollow()

  if (isLoading || pending.length === 0) return null

  return (
    <SectionPanel
      title={`Follow Requests (${pending.length})`}
      description="These users want to follow your private profile"
      icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      }
    >
      <div className="flex flex-col gap-2">
        {pending.map((follower) => (
          <div
            key={follower.userId}
            className={cn(
              'flex items-center gap-3 rounded-xl p-3',
              isDark ? 'bg-white/[0.03]' : 'bg-surface-muted',
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {follower.fullName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
            </div>
            <span className="flex-1 text-sm font-medium text-foreground">{follower.fullName}</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => approve.mutate(follower.userId)}
                disabled={approve.isPending}
                className="rounded-lg border border-emerald-300/30 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 transition-all hover:bg-emerald-500/8"
              >
                Accept
              </button>
              <button
                onClick={() => reject.mutate(follower.userId)}
                disabled={reject.isPending}
                className="rounded-lg border border-red-300/30 px-2.5 py-1 text-[10px] font-bold text-danger transition-all hover:bg-danger/8"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionPanel>
  )
}

export function MyProfilePage() {
  const profileQuery     = useMyProfile()
  const uploadAvatar     = useUploadAvatar()
  const removeAvatar     = useRemoveAvatar()
  const changeVisibility = useChangeVisibility()
  const [openModal, setOpenModal] = useState<OpenModal>(null)
  const user = useAuthStore((s) => s.user)

  if (profileQuery.isPending) {
    return (
      <div className="flex flex-col gap-6 animate-[page-enter_0.3s_ease-out]">
        <div className="overflow-hidden rounded-3xl border border-border bg-surface">
          <div className="skeleton h-48" />
          <div className="px-6 pb-6">
            <div className="skeleton -mt-14 mb-4 h-24 w-24 rounded-full" />
            <div className="skeleton h-8 w-52 rounded-lg mb-2" />
            <div className="skeleton h-4 w-36 rounded mb-5" />
            <div className="flex gap-8 border-t pt-5 border-border">
              <div className="skeleton h-12 w-16 rounded-lg" />
              <div className="skeleton h-12 w-16 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
      </div>
    )
  }

  if (profileQuery.isError) {
    return <Alert variant="error">{toApiError(profileQuery.error).message}</Alert>
  }

  const profile     = profileQuery.data
  const avatarError = uploadAvatar.isError ? toApiError(uploadAvatar.error).message : undefined
  const enrollmentYear = profile.createdAt ? new Date(profile.createdAt).getFullYear() : null

  return (
    <div className="flex flex-col gap-5 animate-[page-enter_0.3s_ease-out]">
      <ProfileHeader
        name={profile.fullName}
        email={user?.email}
        avatarUrl={profile.avatarUrl}
        course={profile.course}
        bio={profile.bio}
        interests={profile.interests}
        enrollmentYear={enrollmentYear}
        followerCount={profile.followerCount}
        followingCount={profile.followingCount}
        role={user?.role}
        onShowFollowers={() => setOpenModal('followers')}
        onShowFollowing={() => setOpenModal('following')}
        actions={
          <Link to={paths.editProfile}>
            <Button variant="secondary" size="sm">Edit profile</Button>
          </Link>
        }
      />

      {/* Pending follow requests — only shows when profile is private and has pending requests */}
      <PendingFollowersPanel />

      {/* Photo panel */}
      <SectionPanel
        title="Profile Photo"
        description="Your photo appears across NUverse"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
          </svg>
        }
      >
        <AvatarUploader
          avatarUrl={profile.avatarUrl}
          name={profile.fullName}
          onUpload={(file) => uploadAvatar.mutate(file)}
          onRemove={() => removeAvatar.mutate()}
          isUploading={uploadAvatar.isPending}
          isRemoving={removeAvatar.isPending}
          serverError={avatarError}
        />
      </SectionPanel>

      {/* Privacy panel — profile visibility only */}
      <SectionPanel
        title="Privacy Settings"
        description="Control who can see your profile"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        }
      >
        <VisibilityToggle
          visibility={profile.visibility}
          onChange={(next) => changeVisibility.mutate(next)}
          isPending={changeVisibility.isPending}
        />
      </SectionPanel>

      <FollowModal
        type={openModal ?? 'followers'}
        isOpen={openModal !== null}
        onClose={() => setOpenModal(null)}
      />
    </div>
  )
}
