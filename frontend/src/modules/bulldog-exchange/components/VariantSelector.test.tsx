import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VariantSelector } from './VariantSelector'
import type { ProductVariant } from '../types'

const variants: ProductVariant[] = [
  { id: 'v1', size: 'S', color: 'Blue', sku: 'SKU-S-BLUE', stock: 10, price: 299, available: true },
  { id: 'v2', size: 'M', color: 'Blue', sku: 'SKU-M-BLUE', stock: 0, price: 299, available: false },
  { id: 'v3', size: null, color: 'Red', sku: 'SKU-RED', stock: 3, price: 350, available: true },
]

describe('VariantSelector', () => {
  it('renders all variants', () => {
    render(<VariantSelector variants={variants} selectedId={null} onChange={() => {}} />)
    expect(screen.getByText('S / Blue')).toBeDefined()
    expect(screen.getByText('M / Blue')).toBeDefined()
    expect(screen.getByText('Red')).toBeDefined()
  })

  it('shows "Default" label when both size and color are null', () => {
    const defaultVariant: ProductVariant = {
      id: 'v4', size: null, color: null, sku: 'SKU-DEFAULT', stock: 5, price: 299, available: true,
    }
    render(<VariantSelector variants={[defaultVariant]} selectedId={null} onChange={() => {}} />)
    expect(screen.getByText('Default')).toBeDefined()
  })

  it('marks the selected variant with aria-pressed=true', () => {
    render(<VariantSelector variants={variants} selectedId="v1" onChange={() => {}} />)
    const buttons = screen.getAllByRole('button')
    const selected = buttons.find((b) => b.getAttribute('aria-pressed') === 'true')
    expect(selected).toBeDefined()
    expect(selected?.textContent).toContain('S / Blue')
  })

  it('calls onChange with the clicked variant id', () => {
    const onChange = vi.fn()
    render(<VariantSelector variants={variants} selectedId={null} onChange={onChange} />)
    fireEvent.click(screen.getByText('S / Blue'))
    expect(onChange).toHaveBeenCalledWith('v1')
  })

  it('shows out-of-stock info for unavailable variants', () => {
    render(<VariantSelector variants={variants} selectedId={null} onChange={() => {}} />)
    expect(screen.getByText(/Out of stock/i)).toBeDefined()
  })

  it('shows low-stock warning for variants with ≤5 stock', () => {
    render(<VariantSelector variants={variants} selectedId={null} onChange={() => {}} />)
    expect(screen.getByText(/Only 3 left/i)).toBeDefined()
  })

  it('renders empty state when no variants provided', () => {
    render(<VariantSelector variants={[]} selectedId={null} onChange={() => {}} />)
    expect(screen.getByText(/No variants available/i)).toBeDefined()
  })
})
