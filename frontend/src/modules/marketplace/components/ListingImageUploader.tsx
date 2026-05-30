import { useRef, useState } from 'react'
import { Button, Spinner } from '@/shared/components/ui'
import { toApiError } from '@/shared/lib/apiClient'
import { ACCEPTED_IMAGE_TYPES, MAX_LISTING_IMAGES, validateImageFile } from '../schemas'
import { useUploadListingImage } from '../hooks/useMarketplace'

interface ListingImageUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
}

/**
 * Multi-image uploader. Validates each file client-side (mirroring the backend
 * `FileValidator`), uploads it to obtain a stored URL, and maintains the ordered
 * list of URLs submitted with the listing. The first image becomes the thumbnail.
 */
export function ListingImageUploader({ value, onChange }: ListingImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const upload = useUploadListingImage()

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)

    const selected = Array.from(files)
    if (value.length + selected.length > MAX_LISTING_IMAGES) {
      setError(`A listing can have at most ${MAX_LISTING_IMAGES} images`)
      return
    }

    const urls: string[] = []
    for (const file of selected) {
      const validationError = validateImageFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      try {
        const { url } = await upload.mutateAsync(file)
        urls.push(url)
      } catch (err) {
        setError(toApiError(err).message)
        return
      }
    }
    onChange([...value, ...urls])
    if (inputRef.current) inputRef.current.value = ''
  }

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const canAddMore = value.length < MAX_LISTING_IMAGES

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {value.map((url, index) => (
          <div key={url} className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
            <img src={url} alt={`Listing image ${index + 1}`} className="h-full w-full object-cover" />
            {index === 0 && (
              <span className="absolute left-1 top-1 rounded bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label={`Remove image ${index + 1}`}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs text-danger-foreground"
            >
              ×
            </button>
          </div>
        ))}
        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={upload.isPending}
            className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {upload.isPending ? <Spinner /> : '+ Add'}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        multiple
        className="hidden"
        aria-label="Upload listing images"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Up to {MAX_LISTING_IMAGES} images · JPG, PNG, or WEBP · max 2 MB each. The first image is the
        cover.
      </p>
      {value.length > 0 && (
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>
          Clear all images
        </Button>
      )}
    </div>
  )
}
