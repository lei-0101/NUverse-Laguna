import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '../services/profileApi'
import { useAuthStore } from '@/shared/store/authStore'
import type {
  ProfileResponse,
  ProfileVisibility,
  PublicProfileResponse,
  UpdatePrivacyPayload,
  UpdateProfilePayload,
} from '../types'

export const profileKeys = {
  me: ['profile', 'me'] as const,
  public: (userId: string) => ['profile', 'public', userId] as const,
  followers: (page: number) => ['profile', 'followers', page] as const,
  following: (page: number) => ['profile', 'following', page] as const,
  pendingFollowers: ['profile', 'pending-followers'] as const,
}

export function useMyProfile() {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: profileApi.getMyProfile,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user, setUser } = useAuthStore()
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.updateProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.me, profile)
      // Sync nav/header name immediately
      if (user) setUser({ ...user, fullName: profile.fullName })
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (profile) => queryClient.setQueryData(profileKeys.me, profile),
  })
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => profileApi.removeAvatar(),
    onSuccess: (profile) => queryClient.setQueryData(profileKeys.me, profile),
  })
}

export function useUpdatePrivacy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdatePrivacyPayload) => profileApi.updatePrivacy(payload),
    onSuccess: (profile) => queryClient.setQueryData(profileKeys.me, profile),
  })
}

export function useChangeVisibility() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (visibility: ProfileVisibility) => profileApi.changeVisibility(visibility),
    onSuccess: (_void, visibility) => {
      const current = queryClient.getQueryData<ProfileResponse>(profileKeys.me)
      if (current) queryClient.setQueryData(profileKeys.me, { ...current, visibility })
    },
  })
}

export function usePublicProfile(userId: string) {
  return useQuery({
    queryKey: profileKeys.public(userId),
    queryFn: () => profileApi.getPublicProfile(userId),
    enabled: Boolean(userId),
  })
}

/**
 * Follows/unfollows a user with an optimistic update of their cached public
 * profile (toggles `isFollowing` and adjusts `followerCount`), rolling back on
 * error.
 */
export function useToggleFollow(userId: string) {
  const queryClient = useQueryClient()
  const key = profileKeys.public(userId)

  return useMutation({
    mutationFn: (isCurrentlyFollowing: boolean) =>
      isCurrentlyFollowing ? profileApi.unfollow(userId) : profileApi.follow(userId),
    onMutate: async (isCurrentlyFollowing) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<PublicProfileResponse>(key)
      if (previous) {
        queryClient.setQueryData<PublicProfileResponse>(key, {
          ...previous,
          isFollowing: !isCurrentlyFollowing,
          followerCount: previous.followerCount + (isCurrentlyFollowing ? -1 : 1),
        })
      }
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}

export function useFollowers(page: number) {
  return useQuery({
    queryKey: profileKeys.followers(page),
    queryFn: () => profileApi.getFollowers(page),
  })
}

export function useFollowing(page: number) {
  return useQuery({
    queryKey: profileKeys.following(page),
    queryFn: () => profileApi.getFollowing(page),
  })
}

export function usePendingFollowers() {
  return useQuery({
    queryKey: profileKeys.pendingFollowers,
    queryFn: profileApi.getPendingFollowers,
    staleTime: 60_000,
  })
}

export function useApproveFollow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (followerId: string) => profileApi.approveFollow(followerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.pendingFollowers }),
  })
}

export function useRejectFollow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (followerId: string) => profileApi.rejectFollow(followerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.pendingFollowers }),
  })
}
