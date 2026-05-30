import { Link } from 'react-router-dom'
import { Avatar, EmptyState } from '@/shared/components/ui'
import { userProfilePath } from '@/shared/routes/paths'
import type { FollowSummary } from '../types'

interface FollowListProps {
  items: FollowSummary[]
  emptyLabel: string
  onNavigate?: () => void
}

/** Renders a list of follower/following summaries as links to their profiles. */
export function FollowList({ items, emptyLabel, onNavigate }: FollowListProps) {
  if (items.length === 0) {
    return <EmptyState title={emptyLabel} />
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {items.map((item) => (
        <li key={item.userId}>
          <Link
            to={userProfilePath(item.userId)}
            onClick={onNavigate}
            className="flex items-center gap-3 py-3 transition-colors hover:bg-surface-muted"
          >
            <Avatar src={item.avatarUrl} name={item.fullName} size="md" />
            <span className="text-sm font-medium text-foreground">{item.fullName}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
