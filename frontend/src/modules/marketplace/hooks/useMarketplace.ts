import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { marketplaceApi } from '../services/marketplaceApi'
import type { ListingDetail, ListingFilters, ListingPayload, ReportPayload } from '../types'

export const marketplaceKeys = {
  all: ['marketplace'] as const,
  list: (filters: ListingFilters, page: number) =>
    ['marketplace', 'list', filters, page] as const,
  detail: (listingId: string) => ['marketplace', 'detail', listingId] as const,
  mine: (page: number) => ['marketplace', 'mine', page] as const,
  saved: (page: number) => ['marketplace', 'saved', page] as const,
}

export function useListings(filters: ListingFilters, page: number) {
  return useQuery({
    queryKey: marketplaceKeys.list(filters, page),
    queryFn: () => marketplaceApi.getListings(filters, page),
  })
}

export function useListing(listingId: string) {
  return useQuery({
    queryKey: marketplaceKeys.detail(listingId),
    queryFn: () => marketplaceApi.getListing(listingId),
    enabled: Boolean(listingId),
  })
}

export function useMyListings(page: number) {
  return useQuery({
    queryKey: marketplaceKeys.mine(page),
    queryFn: () => marketplaceApi.getMyListings(page),
  })
}

export function useSavedListings(page: number) {
  return useQuery({
    queryKey: marketplaceKeys.saved(page),
    queryFn: () => marketplaceApi.getSavedListings(page),
  })
}

export function useUploadListingImage() {
  return useMutation({
    mutationFn: (file: File) => marketplaceApi.uploadImage(file),
  })
}

export function useCreateListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ListingPayload) => marketplaceApi.createListing(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: marketplaceKeys.all }),
  })
}

export function useUpdateListing(listingId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ListingPayload) => marketplaceApi.updateListing(listingId, payload),
    onSuccess: (listing) => {
      queryClient.setQueryData(marketplaceKeys.detail(listingId), listing)
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.all })
    },
  })
}

export function useMarkAsSold(listingId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => marketplaceApi.markAsSold(listingId),
    onSuccess: (listing) => {
      queryClient.setQueryData(marketplaceKeys.detail(listingId), listing)
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.all })
    },
  })
}

export function useRemoveListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (listingId: string) => marketplaceApi.removeListing(listingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: marketplaceKeys.all }),
  })
}

export function useSuspendListing(listingId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => marketplaceApi.suspendListing(listingId),
    onSuccess: (listing) => {
      queryClient.setQueryData(marketplaceKeys.detail(listingId), listing)
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.all })
    },
  })
}

/**
 * Saves/unsaves a listing with an optimistic update of its cached detail
 * (toggles `isSaved`), rolling back on error.
 */
export function useToggleSaveListing(listingId: string) {
  const queryClient = useQueryClient()
  const key = marketplaceKeys.detail(listingId)

  return useMutation({
    mutationFn: (isCurrentlySaved: boolean) =>
      isCurrentlySaved
        ? marketplaceApi.unsaveListing(listingId)
        : marketplaceApi.saveListing(listingId),
    onMutate: async (isCurrentlySaved) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<ListingDetail>(key)
      if (previous) {
        queryClient.setQueryData<ListingDetail>(key, { ...previous, isSaved: !isCurrentlySaved })
      }
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.saved(0) })
    },
  })
}

export function useReportListing(listingId: string) {
  return useMutation({
    mutationFn: (payload: ReportPayload) => marketplaceApi.reportListing(listingId, payload),
  })
}
