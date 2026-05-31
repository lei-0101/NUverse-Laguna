import { apiClient } from '@/shared/lib/apiClient'
import type { Page } from '@/shared/lib/types'

export interface ReportPayload {
  subject: string
  category: string
  description: string
  targetType?: string
  targetId?: string
}

export interface ReportResponse {
  id: string
  reporterId: string
  reporterName: string
  subject: string
  category: string
  description: string
  targetType: string | null
  targetId: string | null
  status: 'OPEN' | 'CLOSED'
  createdAt: string
}

export const reportsApi = {
  submit(data: ReportPayload): Promise<ReportResponse> {
    return apiClient.post('/reports', data).then((r) => r.data.data)
  },

  getAll(page = 0, size = 20): Promise<Page<ReportResponse>> {
    return apiClient.get('/reports', { params: { page, size } }).then((r) => r.data.data)
  },

  close(id: string): Promise<ReportResponse> {
    return apiClient.patch(`/reports/${id}/close`).then((r) => r.data.data)
  },
}
