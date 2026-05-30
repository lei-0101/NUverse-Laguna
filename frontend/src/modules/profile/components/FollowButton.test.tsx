import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FollowButton } from './FollowButton'

describe('FollowButton', () => {
  it('renders "Follow" when not following and fires onClick', async () => {
    const onClick = vi.fn()
    render(<FollowButton isFollowing={false} isPending={false} onClick={onClick} />)

    const button = screen.getByRole('button', { name: /^follow$/i })
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders "Following" when already following', () => {
    render(<FollowButton isFollowing isPending={false} onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: /following/i })).toBeInTheDocument()
  })

  it('is disabled while pending', () => {
    render(<FollowButton isFollowing={false} isPending onClick={vi.fn()} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
