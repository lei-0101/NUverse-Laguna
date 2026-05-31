import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Input, Select, Textarea } from '@/shared/components/ui'
import { editProfileSchema, SCHOOL_OPTIONS, type EditProfileFormValues } from '../schemas'

interface ProfileFormProps {
  defaultValues: EditProfileFormValues
  onSubmit: (values: EditProfileFormValues) => void
  isSubmitting: boolean
  serverError?: string
  onCancel?: () => void
}

export function ProfileForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  serverError,
  onCancel,
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {serverError && <Alert variant="error">{serverError}</Alert>}
      <Input label="Full name" error={errors.fullName?.message} {...register('fullName')} />
      <Select
        label="School"
        placeholder="Select your school"
        options={SCHOOL_OPTIONS}
        error={errors.course?.message}
        {...register('course')}
      />
      <Textarea
        label="Bio"
        placeholder="Tell the campus a little about yourself"
        rows={4}
        error={errors.bio?.message}
        {...register('bio')}
      />
      <Input
        label="Interests"
        placeholder="e.g. basketball, coding, music"
        hint="Separate interests with commas"
        error={errors.interests?.message}
        {...register('interests')}
      />
      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          Save changes
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
