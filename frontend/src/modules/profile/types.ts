/** Mirrors the backend profile DTOs and enums. */

export type ProfileVisibility = 'PUBLIC' | 'PRIVATE'

export type YearLevel = 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH' | 'FIFTH' | 'GRADUATE'

/** Mirrors `ProfileResponse` — the authenticated user's own profile. */
export interface ProfileResponse {
  id: string
  userId: string
  fullName: string
  avatarUrl: string | null
  bio: string | null
  course: string | null
  yearLevel: YearLevel | null
  interests: string | null
  visibility: ProfileVisibility
  hideMarketplaceActivity: boolean
  hideChibiShowcase: boolean
  followerCount: number
  followingCount: number
  createdAt: string
}

/** Mirrors `PublicProfileResponse` — another user's privacy-aware profile. */
export interface PublicProfileResponse {
  userId: string
  fullName: string
  avatarUrl: string | null
  bio: string | null
  course: string | null
  yearLevel: YearLevel | null
  interests: string | null
  followerCount: number
  followingCount: number
  isFollowing: boolean
  isFollowPending: boolean
  isPrivate: boolean
  hideChibiShowcase: boolean
  role: string | null
}

/** Mirrors `FollowSummary` — a row in a follower/following list. */
export interface FollowSummary {
  userId: string
  fullName: string
  avatarUrl: string | null
}

/** Mirrors `UpdateProfileRequest`. Null clears the field server-side. */
export interface UpdateProfilePayload {
  fullName: string
  bio: string | null
  course: string | null
  yearLevel: YearLevel | null
  interests: string | null
}

/** Mirrors `UpdatePrivacyRequest`. */
export interface UpdatePrivacyPayload {
  hideMarketplaceActivity: boolean
  hideChibiShowcase: boolean
}
