export type SuggestionStatus = 'OPEN' | 'UNDER_REVIEW' | 'ACCEPTED' | 'DECLINED' | 'DONE'

export interface Suggestion {
  id: string
  authorId: string
  authorName: string
  title: string
  description: string
  status: SuggestionStatus
  voteCount: number
  hasVoted: boolean
  createdAt: string
}
