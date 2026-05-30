/** Mirrors the backend `ApiResponse<T>` envelope returned by every endpoint. */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

/** Normalized error surfaced to the UI regardless of transport failure shape. */
export interface ApiError {
  status: number
  message: string
}

/** Mirrors a Spring Data `Page<T>` payload (the fields the UI actually uses). */
export interface Page<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}
