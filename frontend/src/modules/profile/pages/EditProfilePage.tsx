import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Card } from '@/shared/components/ui'
import { toApiError } from '@/shared/lib/apiClient'
import { paths } from '@/shared/routes/paths'
import { useMyProfile, useUpdateProfile } from '../hooks/useProfile'
import { ProfileForm } from '../components/ProfileForm'
import { useLeaveGuard } from '@/shared/hooks/useLeaveGuard'
import type { EditProfileFormValues } from '../schemas'
import type { UpdateProfilePayload } from '../types'

function toPayload(values: EditProfileFormValues): UpdateProfilePayload {
  return {
    fullName: values.fullName.trim(),
    course: values.course.trim() || null,
    yearLevel: values.yearLevel || null,
    bio: values.bio.trim() || null,
    interests: values.interests.trim() || null,
  }
}

export function EditProfilePage() {
  const navigate = useNavigate()
  const profileQuery = useMyProfile()
  const updateProfile = useUpdateProfile()
  const [isDirty, setIsDirty] = useState(false)
  useLeaveGuard(isDirty)

  if (profileQuery.isPending) return (
    <Card className="mx-auto max-w-2xl space-y-5 p-6 sm:p-8 animate-[page-enter_0.3s_ease-out]">
      <div className="skeleton h-6 w-32 rounded" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-10 w-full rounded-lg" />
        </div>
      ))}
    </Card>
  )
  if (profileQuery.isError) {
    return <Alert variant="error">{toApiError(profileQuery.error).message}</Alert>
  }

  const profile = profileQuery.data
  const defaultValues: EditProfileFormValues = {
    fullName: profile.fullName,
    course: profile.course ?? '',
    yearLevel: profile.yearLevel ?? '',
    bio: profile.bio ?? '',
    interests: profile.interests ?? '',
  }

  const handleSubmit = (values: EditProfileFormValues) => {
    updateProfile.mutate(toPayload(values), {
      onSuccess: () => {
        setIsDirty(false)
        navigate(paths.profile)
      },
    })
  }

  return (
    <Card
      className="mx-auto max-w-2xl p-6 sm:p-8 animate-[page-enter_0.3s_ease-out]"
      onInput={() => setIsDirty(true)}
    >
      <h1 className="mb-6 text-xl font-bold text-foreground">Edit profile</h1>
      <ProfileForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={updateProfile.isPending}
        serverError={updateProfile.isError ? toApiError(updateProfile.error).message : undefined}
        onCancel={() => navigate(paths.profile)}
      />
    </Card>
  )
}
