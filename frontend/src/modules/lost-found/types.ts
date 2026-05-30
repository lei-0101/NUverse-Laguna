export type ItemType = 'LOST' | 'FOUND'
export type ItemStatus = 'OPEN' | 'RESOLVED'

export interface LostFoundItem {
  id: string
  reporterId: string
  reporterName: string
  type: ItemType
  status: ItemStatus
  title: string
  description: string
  location: string
  itemDate: string
  imageUrl: string | null
  contact: string
  createdAt: string
}
