import { useRef, useState } from 'react'
import { Alert, Avatar, Button } from '@/shared/components/ui'
import { validateAvatarFile } from '../schemas'

interface AvatarUploaderProps {
  avatarUrl: string | null
  name: string
  onUpload: (file: File) => void
  onRemove: () => void
  isUploading: boolean
  isRemoving: boolean
  serverError?: string
}

/**
 * Avatar preview with upload/remove actions. Performs a client-side type/size
 * check (mirroring the backend) before handing the file to the parent; the
 * server remains the source of truth.
 */
export function AvatarUploader({
  avatarUrl,
  name,
  onUpload,
  onRemove,
  isUploading,
  isRemoving,
  serverError,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-selecting the same file
    if (!file) return

    const error = validateAvatarFile(file)
    if (error) {
      setLocalError(error)
      return
    }
    setLocalError(null)
    onUpload(file)
  }

  const busy = isUploading || isRemoving
  const error = localError ?? serverError

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <Avatar src={avatarUrl} name={name} size="xl" />
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            aria-label="Upload avatar"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => inputRef.current?.click()}
            isLoading={isUploading}
            disabled={busy}
          >
            {avatarUrl ? 'Change photo' : 'Upload photo'}
          </Button>
          {avatarUrl && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onRemove}
              isLoading={isRemoving}
              disabled={busy}
            >
              Remove
            </Button>
          )}
          <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP · max 2 MB</p>
        </div>
      </div>
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  )
}
