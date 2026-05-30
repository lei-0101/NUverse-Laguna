import { useRef, useState } from 'react'
import { Spinner } from '@/shared/components/ui'
import { toApiError } from '@/shared/lib/apiClient'
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from '../schemas'
import { useUploadProductImage } from '../hooks/useBulldogExchange'

interface ProductImageUploaderProps {
  value: string | null
  onChange: (url: string | null) => void
}

/** Single-image uploader for merchandise products (admin only). */
export function ProductImageUploader({ value, onChange }: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const upload = useUploadProductImage()

  const handleFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    const file = files[0]!
    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    try {
      const { url } = await upload.mutateAsync(file)
      onChange(url)
    } catch (err) {
      setError(toApiError(err).message)
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative inline-block h-36 w-36 overflow-hidden rounded-lg border border-border">
          <img src={value} alt="Product image" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove product image"
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-sm text-danger-foreground"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          className="flex h-36 w-36 items-center justify-center rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
        >
          {upload.isPending ? <Spinner /> : '+ Upload image'}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="hidden"
        aria-label="Upload product image"
        onChange={(e) => void handleFile(e.target.files)}
      />

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP · max 2 MB</p>
    </div>
  )
}
