/** Mirrors the backend Bulldog Exchange DTOs and domain enums. */

export type MerchandiseCategory =
  | 'CLOTHING'
  | 'ACCESSORIES'
  | 'STATIONERY'
  | 'BAGS'
  | 'EQUIPMENT'
  | 'SHS'
  | 'OTHER'

export type ReservationStatus = 'PENDING' | 'CANCELLED' | 'EXPIRED' | 'FULFILLED'

/** Mirrors `VariantResponse`. */
export interface ProductVariant {
  id: string
  size: string | null
  color: string | null
  sku: string
  stock: number
  price: number
  available: boolean
}

export type MerchandiseGender = 'MALE' | 'FEMALE' | 'UNISEX'

/** Mirrors `ProductCardResponse` — a card in the product grid. */
export interface ProductCard {
  id: string
  name: string
  category: MerchandiseCategory
  gender: MerchandiseGender
  imageUrl: string | null
  variantCount: number
  minPrice: number
  hasStock: boolean
  limited: boolean
}

/** Mirrors `ProductResponse` — full product detail with variants. */
export interface ProductDetail {
  id: string
  name: string
  description: string
  category: MerchandiseCategory
  imageUrl: string | null
  active: boolean
  limited: boolean
  variants: ProductVariant[]
  createdAt: string
  updatedAt: string
}

/** Mirrors `ReservationResponse`. */
export interface Reservation {
  id: string
  variantId: string
  productId: string
  productName: string
  size: string | null
  color: string | null
  sku: string
  price: number
  status: ReservationStatus
  expiresAt: string
  createdAt: string
}

/** Mirrors `UploadImageResponse`. */
export interface UploadedProductImage {
  url: string
}

/** Mirrors `CreateProductRequest` / `UpdateProductRequest`. */
export interface ProductPayload {
  name: string
  description: string
  imageUrl: string | null
  category: MerchandiseCategory
}

/** Mirrors `AddVariantRequest`. */
export interface AddVariantPayload {
  size: string | null
  color: string | null
  sku: string
  stock: number
  price: number
}

/** Mirrors `UpdateStockRequest`. */
export interface UpdateStockPayload {
  stock: number
}
