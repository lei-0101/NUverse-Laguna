import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EventFilters, type EventFiltersValue } from './EventFilters'

describe('EventFilters', () => {
  it('renders category and status selects', () => {
    render(<EventFilters value={{}} onChange={vi.fn()} />)
    expect(screen.getByRole('combobox', { name: /category/i })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: /status/i })).toBeTruthy()
  })

  it('calls onChange with category when category select changes', () => {
    const onChange = vi.fn()
    render(<EventFilters value={{}} onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox', { name: /category/i }), {
      target: { value: 'SPORTS' },
    })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ category: 'SPORTS' }))
  })

  it('calls onChange with status when status select changes', () => {
    const onChange = vi.fn()
    render(<EventFilters value={{}} onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox', { name: /status/i }), {
      target: { value: 'PUBLISHED' },
    })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'PUBLISHED' }))
  })

  it('toggles upcomingOnly when button clicked', () => {
    const onChange = vi.fn()
    render(<EventFilters value={{}} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /upcoming only/i }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ upcomingOnly: true }))
  })

  it('shows clear filters button when filters are active', () => {
    const value: EventFiltersValue = { category: 'ACADEMIC' }
    render(<EventFilters value={value} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeTruthy()
  })

  it('calls onChange with empty object when clear filters is clicked', () => {
    const onChange = vi.fn()
    render(<EventFilters value={{ status: 'PUBLISHED' }} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }))
    expect(onChange).toHaveBeenCalledWith({})
  })

  it('does not show clear filters when no filters active', () => {
    render(<EventFilters value={{}} onChange={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /clear filters/i })).toBeNull()
  })
})
