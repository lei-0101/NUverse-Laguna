import { apiClient, unwrap } from '@/shared/lib/apiClient'
import type { Page } from '@/shared/lib/types'
import type {
  ListingCard,
  ListingDetail,
  ListingFilters,
  ListingPayload,
  ReportPayload,
  UploadedImage,
} from '../types'

/** Thin transport layer for the marketplace endpoints — no business logic. */
export const marketplaceApi = {
  getListings(filters: ListingFilters, page: number, size = 12): Promise<Page<ListingCard>> {
    return unwrap<Page<ListingCard>>(
      apiClient.get('/marketplace', { params: { ...filters, page, size } }),
    )
  },

  getListing(listingId: string): Promise<ListingDetail> {
    return unwrap<ListingDetail>(apiClient.get(`/marketplace/${listingId}`))
  },

  getMyListings(page: number, size = 12): Promise<Page<ListingCard>> {
    return unwrap<Page<ListingCard>>(
      apiClient.get('/marketplace/my-listings', { params: { page, size } }),
    )
  },

  getSavedListings(page: number, size = 12): Promise<Page<ListingCard>> {
    return unwrap<Page<ListingCard>>(
      apiClient.get('/marketplace/saved', { params: { page, size } }),
    )
  },

  uploadImage(file: File): Promise<UploadedImage> {
    const form = new FormData()
    form.append('file', file)
    return unwrap<UploadedImage>(
      apiClient.post('/marketplace/images', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    )
  },

  createListing(payload: ListingPayload): Promise<ListingDetail> {
    return unwrap<ListingDetail>(apiClient.post('/marketplace', payload))
  },

  updateListing(listingId: string, payload: ListingPayload): Promise<ListingDetail> {
    return unwrap<ListingDetail>(apiClient.put(`/marketplace/${listingId}`, payload))
  },

  markAsSold(listingId: string): Promise<ListingDetail> {
    return unwrap<ListingDetail>(apiClient.patch(`/marketplace/${listingId}/sold`))
  },

  removeListing(listingId: string): Promise<void> {
    return apiClient.delete(`/marketplace/${listingId}`).then(() => undefined)
  },

  suspendListing(listingId: string): Promise<ListingDetail> {
    return unwrap<ListingDetail>(apiClient.patch(`/marketplace/${listingId}/suspend`))
  },

  saveListing(listingId: string): Promise<void> {
    return apiClient.post(`/marketplace/${listingId}/save`).then(() => undefined)
  },

  unsaveListing(listingId: string): Promise<void> {
    return apiClient.delete(`/marketplace/${listingId}/save`).then(() => undefined)
  },

  reportListing(listingId: string, payload: ReportPayload): Promise<void> {
    return apiClient.post(`/marketplace/${listingId}/report`, payload).then(() => undefined)
  },

  messageSeller(listingId: string, message: string): Promise<void> {
    return apiClient.post(`/marketplace/${listingId}/message`, { message }).then(() => undefined)
  },
}
