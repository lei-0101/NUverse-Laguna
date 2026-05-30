import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card } from '@/shared/components/ui'
import { toApiError } from '@/shared/lib/apiClient'
import { paths } from '@/shared/routes/paths'
import {
  useChangeVisibility,
  useMyProfile,
  useRemoveAvatar,
  useUpdatePrivacy,
  useUploadAvatar,
} from '../hooks/useProfile'
import { ProfileHeader } from '../components/ProfileHeader'
import { AvatarUploader } from '../components/AvatarUploader'
import { VisibilityToggle } from '../components/VisibilityToggle'
import { PrivacyToggles } from '../components/PrivacyToggles'
import { FollowModal } from '../components/FollowModal'

type OpenModal = 'followers' | 'following' | null

export function MyProfilePage() {
  const profileQuery = useMyProfile()
  const uploadAvatar = useUploadAvatar()
  const removeAvatar = useRemoveAvatar()
  const changeVisibility = useChangeVisibility()
  const updatePrivacy = useUpdatePrivacy()
  const [openModal, setOpenModal] = useState<OpenModal>(null)

  if (profileQuery.isPending) return (
    <div className="flex flex-col gap-6 animate-[page-enter_0.3s_ease-out]">
      <div className="rounded-2xl overflow-hidden border border-border bg-surface shadow-sm">
        <div className="skeleton h-36" />
        <div className="px-6 pb-6">
          <div className="skeleton -mt-10 mb-4 h-20 w-20 rounded-full" />
          <div className="skeleton h-7 w-48 rounded mb-2" />
          <div className="skeleton h-4 w-36 rounded mb-4" />
          <div className="flex gap-6 border-t border-border pt-4">
            <div className="skeleton h-10 w-16 rounded" />
            <div className="skeleton h-10 w-16 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
  if (profileQuery.isError) {
    return <Alert variant="error">{toApiError(profileQuery.error).message}</Alert>
  }

  const profile = profileQuery.data
  const avatarError =
    uploadAvatar.isError ? toApiError(uploadAvatar.error).message : undefined

  return (
    <div className="flex flex-col gap-6 animate-[page-enter_0.3s_ease-out]">
      <ProfileHeader
        name={profile.fullName}
        avatarUrl={profile.avatarUrl}
        course={profile.course}
        yearLevel={profile.yearLevel}
        bio={profile.bio}
        interests={profile.interests}
        followerCount={profile.followerCount}
        followingCount={profile.followingCount}
        onShowFollowers={() => setOpenModal('followers')}
        onShowFollowing={() => setOpenModal('following')}
        actions={
          <Link to={paths.editProfile}>
            <Button variant="secondary" size="sm">
              Edit profile
            </Button>
          </Link>
        }
      />

      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-sm font-semibold text-foreground">Profile photo</h2>
        <AvatarUploader
          avatarUrl={profile.avatarUrl}
          name={profile.fullName}
          onUpload={(file) => uploadAvatar.mutate(file)}
          onRemove={() => removeAvatar.mutate()}
          isUploading={uploadAvatar.isPending}
          isRemoving={removeAvatar.isPending}
          serverError={avatarError}
        />
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-sm font-semibold text-foreground">Privacy</h2>
        <VisibilityToggle
          visibility={profile.visibility}
          onChange={(next) => changeVisibility.mutate(next)}
          isPending={changeVisibility.isPending}
        />
        <div className="border-t border-border pt-4">
          <PrivacyToggles
            hideMarketplaceActivity={profile.hideMarketplaceActivity}
            hideChibiShowcase={profile.hideChibiShowcase}
            onChange={(next) => updatePrivacy.mutate(next)}
            isPending={updatePrivacy.isPending}
          />
        </div>
      </Card>

      <FollowModal
        type={openModal ?? 'followers'}
        isOpen={openModal !== null}
        onClose={() => setOpenModal(null)}
      />
    </div>
  )
}
