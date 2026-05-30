/** Mirrors the backend marketplace DTOs and domain enums. */

export type ListingCategory =
  | 'SCHOOL_SUPPLIES'
  | 'BOOKS'
  | 'GADGETS'
  | 'UNIFORMS'
  | 'ACCESSORIES'
  | 'DORM_ESSENTIALS'
  | 'FOOD'
  | 'SERVICES'
  | 'ART_COMMISSIONS'

export type ListingCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR'

export type ListingStatus = 'AVAILABLE' | 'SOLD' | 'REMOVED' | 'SUSPENDED'

/** Shared seller identity projection (`ProfileSummary`). */
export interface SellerSummary {
  userId: string
  fullName: string
  avatarUrl: string | null
}

/** Mirrors `ListingCardResponse` — a card in any listing grid. */
export interface ListingCard {
  id: string
  title: string
  price: number
  category: ListingCategory
  condition: ListingCondition
  status: ListingStatus
  thumbnailUrl: string | null
  seller: SellerSummary
  createdAt: string
}

/** Mirrors `ListingResponse` — the full listing detail. */
export interface ListingDetail {
  id: string
  title: string
  description: string
  price: number
  category: ListingCategory
  condition: ListingCondition
  status: ListingStatus
  imageUrls: string[]
  seller: SellerSummary
  isSaved: boolean
  createdAt: string
  updatedAt: string
}

/** Mirrors `CreateListingRequest` / `UpdateListingRequest`. */
export interface ListingPayload {
  title: string
  description: string
  price: number
  category: ListingCategory
  condition: ListingCondition
  imageUrls: string[]
}

/** Mirrors `ReportListingRequest`. */
export interface ReportPayload {
  reason: string
}

/** Mirrors `UploadImageResponse`. */
export interface UploadedImage {
  url: string
}

/** Query parameters accepted by the browse endpoint. */
export interface ListingFilters {
  keyword?: string
  category?: ListingCategory
  condition?: ListingCondition
  minPrice?: number
  maxPrice?: number
}
