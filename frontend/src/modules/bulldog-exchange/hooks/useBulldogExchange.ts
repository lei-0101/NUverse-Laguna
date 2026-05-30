import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bulldogExchangeApi } from '../services/bulldogExchangeApi'
import type { AddVariantPayload, MerchandiseCategory, ProductPayload, UpdateStockPayload } from '../types'

export const exchangeKeys = {
  all: ['bulldog-exchange'] as const,
  list: (category: MerchandiseCategory | null, page: number) =>
    ['bulldog-exchange', 'list', category, page] as const,
  detail: (productId: string) => ['bulldog-exchange', 'detail', productId] as const,
  myReservations: (page: number) => ['bulldog-exchange', 'my-reservations', page] as const,
}

export function useProducts(category: MerchandiseCategory | null, page: number) {
  return useQuery({
    queryKey: exchangeKeys.list(category, page),
    queryFn: () => bulldogExchangeApi.getProducts(category, page),
  })
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: exchangeKeys.detail(productId),
    queryFn: () => bulldogExchangeApi.getProduct(productId),
    enabled: Boolean(productId),
  })
}

export function useMyReservations(page: number) {
  return useQuery({
    queryKey: exchangeKeys.myReservations(page),
    queryFn: () => bulldogExchangeApi.getMyReservations(page),
  })
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: (file: File) => bulldogExchangeApi.uploadImage(file),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductPayload) => bulldogExchangeApi.createProduct(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: exchangeKeys.all }),
  })
}

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductPayload) => bulldogExchangeApi.updateProduct(productId, payload),
    onSuccess: (product) => {
      queryClient.setQueryData(exchangeKeys.detail(productId), product)
      queryClient.invalidateQueries({ queryKey: exchangeKeys.all })
    },
  })
}

export function useDeactivateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) => bulldogExchangeApi.deactivateProduct(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: exchangeKeys.all }),
  })
}

export function useAddVariant(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AddVariantPayload) => bulldogExchangeApi.addVariant(productId, payload),
    onSuccess: (product) => {
      queryClient.setQueryData(exchangeKeys.detail(productId), product)
    },
  })
}

export function useUpdateVariantStock(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ variantId, payload }: { variantId: string; payload: UpdateStockPayload }) =>
      bulldogExchangeApi.updateVariantStock(variantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exchangeKeys.detail(productId) })
    },
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variantId: string) => bulldogExchangeApi.createReservation(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulldog-exchange', 'my-reservations'] })
    },
  })
}

export function useCancelReservation(page: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reservationId: string) => bulldogExchangeApi.cancelReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exchangeKeys.myReservations(page) })
    },
  })
}
