import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarketplaceFilters } from './MarketplaceFilters'

describe('MarketplaceFilters', () => {
  it('emits only the populated filters on apply', async () => {
    const onApply = vi.fn()
    render(<MarketplaceFilters initial={{}} onApply={onApply} />)

    await userEvent.type(screen.getByLabelText(/search/i), 'textbook')
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'BOOKS')
    await userEvent.type(screen.getByLabelText(/min price/i), '100')
    await userEvent.click(screen.getByRole('button', { name: /apply filters/i }))

    expect(onApply).toHaveBeenCalledOnce()
    expect(onApply.mock.calls[0][0]).toEqual({
      keyword: 'textbook',
      category: 'BOOKS',
      minPrice: 100,
    })
  })

  it('omits blank fields rather than sending empty params', async () => {
    const onApply = vi.fn()
    render(<MarketplaceFilters initial={{}} onApply={onApply} />)

    await userEvent.click(screen.getByRole('button', { name: /apply filters/i }))

    expect(onApply).toHaveBeenCalledWith({})
  })

  it('clears all fields and emits empty filters on reset', async () => {
    const onApply = vi.fn()
    render(<MarketplaceFilters initial={{ keyword: 'old', category: 'GADGETS' }} onApply={onApply} />)

    await userEvent.click(screen.getByRole('button', { name: /reset/i }))

    expect(onApply).toHaveBeenCalledWith({})
    expect(screen.getByLabelText(/search/i)).toHaveValue('')
  })
})
