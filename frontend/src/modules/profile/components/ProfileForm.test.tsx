import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileForm } from './ProfileForm'
import type { EditProfileFormValues } from '../schemas'

const defaults: EditProfileFormValues = {
  fullName: 'Juan Dela Cruz',
  course: '',
  yearLevel: '',
  bio: '',
  interests: '',
}

describe('ProfileForm', () => {
  it('blocks submit and shows an error when the name is too short', async () => {
    const onSubmit = vi.fn()
    render(<ProfileForm defaultValues={{ ...defaults, fullName: 'J' }} onSubmit={onSubmit} isSubmitting={false} />)

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the edited values when valid', async () => {
    const onSubmit = vi.fn()
    render(<ProfileForm defaultValues={defaults} onSubmit={onSubmit} isSubmitting={false} />)

    await userEvent.type(screen.getByLabelText(/course/i), 'BS Information Technology')
    await userEvent.selectOptions(screen.getByLabelText(/year level/i), 'SECOND')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      fullName: 'Juan Dela Cruz',
      course: 'BS Information Technology',
      yearLevel: 'SECOND',
    })
  })

  it('renders a server error when provided', () => {
    render(
      <ProfileForm
        defaultValues={defaults}
        onSubmit={vi.fn()}
        isSubmitting={false}
        serverError="Something went wrong"
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i)
  })
})
