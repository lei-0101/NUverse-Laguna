import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ListingImageUploader } from './ListingImageUploader'
import { MAX_IMAGE_BYTES, MAX_LISTING_IMAGES } from '../schemas'
import { marketplaceApi } from '../services/marketplaceApi'

vi.mock('../services/marketplaceApi', () => ({
  marketplaceApi: { uploadImage: vi.fn() },
}))

function imageFile(type: string, size: number, name = 'photo'): File {
  return new File([new Blob([new Uint8Array(size)], { type })], name, { type })
}

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

function renderUploader(value: string[] = []) {
  const onChange = vi.fn()
  render(<ListingImageUploader value={value} onChange={onChange} />, { wrapper })
  return { onChange }
}

describe('ListingImageUploader', () => {
  beforeEach(() => vi.clearAllMocks())

  it('uploads a valid image and appends its URL', async () => {
    vi.mocked(marketplaceApi.uploadImage).mockResolvedValue({ url: '/uploads/listings/a.png' })
    const { onChange } = renderUploader([])

    fireEvent.change(screen.getByLabelText(/upload listing images/i), {
      target: { files: [imageFile('image/png', 1024)] },
    })

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['/uploads/listings/a.png']))
  })

  it('rejects an oversized image without uploading', async () => {
    const { onChange } = renderUploader([])

    fireEvent.change(screen.getByLabelText(/upload listing images/i), {
      target: { files: [imageFile('image/png', MAX_IMAGE_BYTES + 1)] },
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(/2 MB/i)
    expect(marketplaceApi.uploadImage).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('rejects a non-image file', async () => {
    const { onChange } = renderUploader([])

    fireEvent.change(screen.getByLabelText(/upload listing images/i), {
      target: { files: [imageFile('application/pdf', 1024)] },
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(/JPG, PNG, or WEBP/i)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('rejects exceeding the maximum image count', async () => {
    const existing = Array.from({ length: MAX_LISTING_IMAGES }, (_, i) => `/uploads/${i}.png`)
    const { onChange } = renderUploader(existing)

    fireEvent.change(screen.getByLabelText(/upload listing images/i), {
      target: { files: [imageFile('image/png', 1024)] },
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(/at most 10 images/i)
    expect(marketplaceApi.uploadImage).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })
})
