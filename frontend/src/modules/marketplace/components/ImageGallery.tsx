import { useState } from 'react'
import { cn } from '@/shared/lib/cn'

interface ImageGalleryProps {
  images: string[]
  title: string
}

/** Detail-page gallery: a large active image with selectable thumbnails. */
export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-surface-muted text-sm text-muted-foreground">
        No images
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-surface-muted">
        <img src={images[active]} alt={title} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === active}
              className={cn(
                'h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2',
                index === active ? 'border-primary' : 'border-transparent',
              )}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
