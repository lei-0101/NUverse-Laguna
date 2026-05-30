import { apiClient, unwrap } from '@/shared/lib/apiClient'
import type { ApiResponse, Page } from '@/shared/lib/types'
import type { Notification, UnreadCountResponse } from '../types'

export const notificationsApi = {
  getMyNotifications: (page = 0, size = 20) =>
    unwrap(
      apiClient.get<ApiResponse<Page<Notification>>>('/notifications', {
        params: { page, size },
      }),
    ),

  getUnreadCount: () =>
    unwrap(apiClient.get<ApiResponse<UnreadCountResponse>>('/notifications/unread-count')),

  markAsRead: (notificationId: string) =>
    unwrap(apiClient.patch<ApiResponse<void>>(`/notifications/${notificationId}/read`)),

  markAllAsRead: () =>
    unwrap(apiClient.patch<ApiResponse<void>>('/notifications/read-all')),

  deleteNotification: (notificationId: string) =>
    unwrap(apiClient.delete<ApiResponse<void>>(`/notifications/${notificationId}`)),
}
