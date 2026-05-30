import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { exchangeKeys, useCreateReservation } from './useBulldogExchange'
import { bulldogExchangeApi } from '../services/bulldogExchangeApi'
import type { Reservation } from '../types'

vi.mock('../services/bulldogExchangeApi', () => ({
  bulldogExchangeApi: {
    createReservation: vi.fn(),
    getMyReservations: vi.fn(),
  },
}))

const VARIANT_ID = 'variant-1'
const RESERVATION_ID = 'reservation-1'
const PRODUCT_ID = 'product-1'

const sampleReservation: Reservation = {
  id: RESERVATION_ID,
  variantId: VARIANT_ID,
  productId: PRODUCT_ID,
  productName: 'NU Shirt',
  size: 'M',
  color: 'Blue',
  sku: 'SKU-001',
  price: 299,
  status: 'PENDING',
  expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
}

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, wrapper }
}

describe('useCreateReservation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls createReservation with the variant ID on success', async () => {
    vi.mocked(bulldogExchangeApi.createReservation).mockResolvedValue(sampleReservation)
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateReservation(), { wrapper })

    result.current.mutate(VARIANT_ID)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(bulldogExchangeApi.createReservation).toHaveBeenCalledWith(VARIANT_ID)
    expect(result.current.data?.status).toBe('PENDING')
  })

  it('exposes an error when the API call fails', async () => {
    vi.mocked(bulldogExchangeApi.createReservation).mockRejectedValue(new Error('Out of stock'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateReservation(), { wrapper })

    result.current.mutate(VARIANT_ID)

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('invalidates the my-reservations cache on success', async () => {
    vi.mocked(bulldogExchangeApi.createReservation).mockResolvedValue(sampleReservation)
    const { client, wrapper } = setup()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')
    const { result } = renderHook(() => useCreateReservation(), { wrapper })

    result.current.mutate(VARIANT_ID)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['bulldog-exchange', 'my-reservations'] }),
    )
  })
})

// ── exchangeKeys ──────────────────────────────────────────────────────────────

describe('exchangeKeys', () => {
  it('list key includes category and page', () => {
    const key = exchangeKeys.list('CLOTHING', 2)
    expect(key).toContain('CLOTHING')
    expect(key).toContain(2)
  })

  it('detail key includes productId', () => {
    const key = exchangeKeys.detail('prod-1')
    expect(key).toContain('prod-1')
  })

  it('myReservations key includes page', () => {
    const key = exchangeKeys.myReservations(3)
    expect(key).toContain(3)
  })
})
