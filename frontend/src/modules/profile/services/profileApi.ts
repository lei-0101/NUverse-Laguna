import { apiClient, unwrap } from '@/shared/lib/apiClient'
import type { Page } from '@/shared/lib/types'
import type {
  FollowSummary,
  ProfileResponse,
  ProfileVisibility,
  PublicProfileResponse,
  UpdatePrivacyPayload,
  UpdateProfilePayload,
} from '../types'

/** Thin transport layer for the profile endpoints — no business logic. */
export const profileApi = {
  getMyProfile(): Promise<ProfileResponse> {
    return unwrap<ProfileResponse>(apiClient.get('/profile/me'))
  },

  updateProfile(payload: UpdateProfilePayload): Promise<ProfileResponse> {
    return unwrap<ProfileResponse>(apiClient.put('/profile/me', payload))
  },

  uploadAvatar(file: File): Promise<ProfileResponse> {
    const form = new FormData()
    form.append('file', file)
    return unwrap<ProfileResponse>(
      apiClient.post('/profile/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    )
  },

  removeAvatar(): Promise<ProfileResponse> {
    return unwrap<ProfileResponse>(apiClient.delete('/profile/me/avatar'))
  },

  updatePrivacy(payload: UpdatePrivacyPayload): Promise<ProfileResponse> {
    return unwrap<ProfileResponse>(apiClient.patch('/profile/me/privacy', payload))
  },

  changeVisibility(visibility: ProfileVisibility): Promise<void> {
    return apiClient
      .patch('/profile/me/visibility', null, { params: { visibility } })
      .then(() => undefined)
  },

  getPublicProfile(userId: string): Promise<PublicProfileResponse> {
    return unwrap<PublicProfileResponse>(apiClient.get(`/profile/${userId}`))
  },

  follow(userId: string): Promise<void> {
    return apiClient.post(`/profile/${userId}/follow`).then(() => undefined)
  },

  unfollow(userId: string): Promise<void> {
    return apiClient.delete(`/profile/${userId}/follow`).then(() => undefined)
  },

  getFollowers(page: number, size = 20): Promise<Page<FollowSummary>> {
    return unwrap<Page<FollowSummary>>(
      apiClient.get('/profile/me/followers', { params: { page, size } }),
    )
  },

  getFollowing(page: number, size = 20): Promise<Page<FollowSummary>> {
    return unwrap<Page<FollowSummary>>(
      apiClient.get('/profile/me/following', { params: { page, size } }),
    )
  },
}
