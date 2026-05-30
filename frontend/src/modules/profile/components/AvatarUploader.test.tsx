import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AvatarUploader } from './AvatarUploader'
import { MAX_AVATAR_BYTES } from '../schemas'

function imageFile(type: string, size: number, name = 'photo'): File {
  return new File([new Blob([new Uint8Array(size)], { type })], name, { type })
}

function renderUploader(overrides: Partial<Parameters<typeof AvatarUploader>[0]> = {}) {
  const onUpload = vi.fn()
  const onRemove = vi.fn()
  render(
    <AvatarUploader
      avatarUrl={null}
      name="Juan Dela Cruz"
      onUpload={onUpload}
      onRemove={onRemove}
      isUploading={false}
      isRemoving={false}
      {...overrides}
    />,
  )
  return { onUpload, onRemove }
}

describe('AvatarUploader', () => {
  it('uploads a valid image', async () => {
    const { onUpload } = renderUploader()
    const file = imageFile('image/png', 1024)

    await userEvent.upload(screen.getByLabelText(/upload avatar/i), file)

    expect(onUpload).toHaveBeenCalledOnce()
    expect(onUpload.mock.calls[0][0]).toBe(file)
  })

  it('rejects a file that is too large without calling onUpload', async () => {
    const { onUpload } = renderUploader()

    await userEvent.upload(
      screen.getByLabelText(/upload avatar/i),
      imageFile('image/png', MAX_AVATAR_BYTES + 1),
    )

    expect(onUpload).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/2 MB/i)
  })

  it('rejects a non-image type', () => {
    const { onUpload } = renderUploader()
    // fireEvent bypasses the input's `accept` filter so the component's own
    // type guard (the real defense) is exercised directly.
    fireEvent.change(screen.getByLabelText(/upload avatar/i), {
      target: { files: [imageFile('application/pdf', 1024, 'doc.pdf')] },
    })

    expect(onUpload).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/JPG, PNG, or WEBP/i)
  })

  it('shows a remove action only when an avatar exists', () => {
    const { onRemove } = renderUploader({ avatarUrl: '/uploads/avatars/a.png' })
    const removeButton = screen.getByRole('button', { name: /remove/i })
    removeButton.click()
    expect(onRemove).toHaveBeenCalledOnce()
  })
})
