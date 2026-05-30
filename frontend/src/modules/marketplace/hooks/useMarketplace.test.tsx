import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { marketplaceKeys, useToggleSaveListing } from './useMarketplace'
import { marketplaceApi } from '../services/marketplaceApi'
import type { ListingDetail } from '../types'

vi.mock('../services/marketplaceApi', () => ({
  marketplaceApi: { saveListing: vi.fn(), unsaveListing: vi.fn() },
}))

const LISTING_ID = 'listing-1'

const detail: ListingDetail = {
  id: LISTING_ID,
  title: 'Item',
  description: 'desc',
  price: 100,
  category: 'BOOKS',
  condition: 'GOOD',
  status: 'AVAILABLE',
  imageUrls: [],
  seller: { userId: 'u1', fullName: 'Seller', avatarUrl: null },
  isSaved: false,
  createdAt: '2026-05-30T00:00:00',
  updatedAt: '2026-05-30T00:00:00',
}

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(marketplaceKeys.detail(LISTING_ID), detail)
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, wrapper }
}

describe('useToggleSaveListing', () => {
  beforeEach(() => vi.clearAllMocks())

  it('optimistically flips isSaved before the request resolves', async () => {
    vi.mocked(marketplaceApi.saveListing).mockReturnValue(new Promise(() => {}))
    const { client, wrapper } = setup()
    const { result } = renderHook(() => useToggleSaveListing(LISTING_ID), { wrapper })

    result.current.mutate(false)

    await waitFor(() =>
      expect(client.getQueryData<ListingDetail>(marketplaceKeys.detail(LISTING_ID))?.isSaved).toBe(
        true,
      ),
    )
    expect(marketplaceApi.saveListing).toHaveBeenCalledWith(LISTING_ID)
  })

  it('rolls back the optimistic update when the request fails', async () => {
    vi.mocked(marketplaceApi.saveListing).mockRejectedValue(new Error('boom'))
    const { client, wrapper } = setup()
    const { result } = renderHook(() => useToggleSaveListing(LISTING_ID), { wrapper })

    result.current.mutate(false)

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(
      client.getQueryData<ListingDetail>(marketplaceKeys.detail(LISTING_ID))?.isSaved,
    ).toBe(false)
  })
})
