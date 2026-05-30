import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('shows validation errors and does not submit when empty', async () => {
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} isSubmitting={false} />)

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the entered credentials when valid', async () => {
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} isSubmitting={false} />)

    await userEvent.type(screen.getByLabelText(/email/i), 'juan@national-u.edu.ph')
    await userEvent.type(screen.getByLabelText('Password'), 'Password1')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toEqual({
      email: 'juan@national-u.edu.ph',
      password: 'Password1',
    })
  })

  it('renders a server error when provided', () => {
    render(
      <LoginForm
        onSubmit={vi.fn()}
        isSubmitting={false}
        serverError="Invalid email or password"
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/invalid email or password/i)
  })
})
