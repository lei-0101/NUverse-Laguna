import { apiClient, unwrap } from '@/shared/lib/apiClient'
import type { Page } from '@/shared/lib/types'
import type {
  AddVariantPayload,
  MerchandiseCategory,
  ProductCard,
  ProductDetail,
  ProductPayload,
  ProductVariant,
  Reservation,
  UpdateStockPayload,
  UploadedProductImage,
} from '../types'

/** Thin transport layer for the Bulldog Exchange endpoints — no business logic. */
export const bulldogExchangeApi = {
  // ── Images ──────────────────────────────────────────────────────────────────

  uploadImage(file: File): Promise<UploadedProductImage> {
    const form = new FormData()
    form.append('file', file)
    return unwrap<UploadedProductImage>(
      apiClient.post('/bulldog-exchange/images', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    )
  },

  // ── Products ─────────────────────────────────────────────────────────────────

  getProducts(
    category: MerchandiseCategory | null,
    gender: 'MALE' | 'FEMALE' | 'UNISEX' | null,
    keyword: string | null,
    page: number,
    size = 12,
  ): Promise<Page<ProductCard>> {
    return unwrap<Page<ProductCard>>(
      apiClient.get('/bulldog-exchange', {
        params: {
          ...(category ? { category } : {}),
          ...(gender ? { gender } : {}),
          ...(keyword ? { keyword } : {}),
          page,
          size,
        },
      }),
    )
  },

  getProduct(productId: string): Promise<ProductDetail> {
    return unwrap<ProductDetail>(apiClient.get(`/bulldog-exchange/${productId}`))
  },

  createProduct(payload: ProductPayload): Promise<ProductDetail> {
    return unwrap<ProductDetail>(apiClient.post('/bulldog-exchange', payload))
  },

  updateProduct(productId: string, payload: ProductPayload): Promise<ProductDetail> {
    return unwrap<ProductDetail>(apiClient.put(`/bulldog-exchange/${productId}`, payload))
  },

  deactivateProduct(productId: string): Promise<void> {
    return apiClient.delete(`/bulldog-exchange/${productId}`).then(() => undefined)
  },

  // ── Variants ──────────────────────────────────────────────────────────────────

  addVariant(productId: string, payload: AddVariantPayload): Promise<ProductDetail> {
    return unwrap<ProductDetail>(
      apiClient.post(`/bulldog-exchange/${productId}/variants`, payload),
    )
  },

  updateVariantStock(variantId: string, payload: UpdateStockPayload): Promise<ProductVariant> {
    return unwrap<ProductVariant>(
      apiClient.patch(`/bulldog-exchange/variants/${variantId}/stock`, payload),
    )
  },

  updateVariant(variantId: string, payload: AddVariantPayload): Promise<ProductVariant> {
    return unwrap<ProductVariant>(
      apiClient.put(`/bulldog-exchange/variants/${variantId}`, payload),
    )
  },

  deleteVariant(variantId: string): Promise<void> {
    return apiClient.delete(`/bulldog-exchange/variants/${variantId}`).then(() => undefined)
  },

  // ── Reservations ──────────────────────────────────────────────────────────────

  createReservation(variantId: string): Promise<Reservation> {
    return unwrap<Reservation>(
      apiClient.post(`/bulldog-exchange/variants/${variantId}/reserve`),
    )
  },

  getMyReservations(page: number, size = 12): Promise<Page<Reservation>> {
    return unwrap<Page<Reservation>>(
      apiClient.get('/bulldog-exchange/my-reservations', { params: { page, size } }),
    )
  },

  cancelReservation(reservationId: string): Promise<Reservation> {
    return unwrap<Reservation>(
      apiClient.patch(`/bulldog-exchange/reservations/${reservationId}/cancel`),
    )
  },
}
