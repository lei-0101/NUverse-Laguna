import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { suggestionsApi } from '../services/suggestionsApi'
import type { Suggestion } from '../types'
import { Button, EmptyState, Modal, Input, Textarea } from '@/shared/components/ui'
import { cn } from '@/shared/lib/cn'
import { toast } from '@/shared/store/toastStore'
import { useCountUp } from '@/shared/hooks/useCountUp'

const STATUS_STYLES: Record<string, string> = {
  OPEN:         'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ACCEPTED:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  DECLINED:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  DONE:         'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

/* Tiny sparkle burst — 3 stars scatter on vote */
function SparkleParticle({ index }: { index: number }) {
  const angle = (index / 3) * 120 + 30
  const rad = (angle * Math.PI) / 180
  const tx = Math.cos(rad) * 22
  const ty = Math.sin(rad) * 22
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        animation: 'sparkle-burst 0.5s ease-out forwards',
        ['--tx' as string]: `${tx}px`,
        ['--ty' as string]: `${ty}px`,
      }}
    >
      <svg width="8" height="8" viewBox="0 0 8 8">
        <path d="M4 0L4.9 3.1H8L5.6 5L6.5 8L4 6.2L1.5 8L2.4 5L0 3.1H3.1Z"
          fill="var(--color-accent)" />
      </svg>
    </div>
  )
}

function SuggestionCard({ suggestion, onVote, onUnvote }: {
  suggestion: Suggestion
  onVote: (id: string) => void
  onUnvote: (id: string) => void
}) {
  const [sparkling, setSparkling] = useState(false)

  const handleVoteClick = () => {
    if (!suggestion.hasVoted) {
      setSparkling(true)
      setTimeout(() => setSparkling(false), 600)
    }
    if (suggestion.hasVoted) {
      onUnvote(suggestion.id)
    } else {
      onVote(suggestion.id)
    }
  }

  return (
    <div
      className={cn(
        'group flex gap-4 rounded-2xl border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg',
        suggestion.hasVoted
          ? 'border-primary/40'
          : 'border-border',
      )}
      style={suggestion.hasVoted ? { boxShadow: '0 0 0 1px rgba(74,110,232,0.2)' } : undefined}
    >
      {/* Upvote column */}
      <div className="flex shrink-0 flex-col items-center">
        <div className="relative">
          {sparkling && [0, 1, 2].map((i) => <SparkleParticle key={i} index={i} />)}
          <button
            onClick={handleVoteClick}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl border px-3 py-2.5 text-center transition-all active:scale-90',
              suggestion.hasVoted
                ? 'border-primary/60 bg-primary/12 text-primary shadow-sm shadow-primary/20'
                : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
            )}
            aria-label={suggestion.hasVoted ? 'Remove upvote' : 'Upvote'}
          >
            <svg
              width="14" height="14" viewBox="0 0 14 14"
              fill={suggestion.hasVoted ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              className={cn('transition-transform', suggestion.hasVoted ? 'scale-110' : '')}
            >
              <path d="M7 2L12.5 9H1.5L7 2Z" />
            </svg>
            <span className="font-mono tabular-nums text-base font-bold leading-none">
              {suggestion.voteCount}
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{suggestion.title}</h3>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', STATUS_STYLES[suggestion.status])}>
            {suggestion.status.replace('_', ' ')}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">{suggestion.description}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span>👤 {suggestion.authorName}</span>
          <span>🕐 {new Date(suggestion.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}

function SuggestionsStatsBar({ total, votes, inProgress }: { total: number; votes: number; inProgress: number }) {
  const animTotal = useCountUp(total)
  const animVotes = useCountUp(votes)
  const animInProg = useCountUp(inProgress)
  return (
    <div className="flex gap-6 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col items-center gap-0.5">
        <p className="font-mono tabular-nums text-2xl font-bold text-foreground">{animTotal}</p>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Ideas</p>
      </div>
      <div className="h-full w-px bg-border" />
      <div className="flex flex-col items-center gap-0.5">
        <p className="font-mono tabular-nums text-2xl font-bold text-primary">{animVotes}</p>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Total Votes</p>
      </div>
      <div className="h-full w-px bg-border" />
      <div className="flex flex-col items-center gap-0.5">
        <p className="font-mono tabular-nums text-2xl font-bold text-success">{animInProg}</p>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">In Progress</p>
      </div>
    </div>
  )
}

export function SuggestionsPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: () => suggestionsApi.getAll(),
    staleTime: 60_000,
  })

  const createMutation = useMutation({
    mutationFn: () => suggestionsApi.create(title, description),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suggestions'] })
      toast.success('Suggestion posted!')
      setShowForm(false)
      setTitle('')
      setDescription('')
    },
    onError: () => toast.error('Failed to post suggestion.'),
  })

  const voteMutation = useMutation({
    mutationFn: (id: string) => suggestionsApi.vote(id),
    onSuccess: (updated) => {
      qc.setQueryData(['suggestions'], (old: typeof data) => {
        if (!old) return old
        return { ...old, content: old.content.map((s) => s.id === updated.id ? updated : s) }
      })
    },
    onError: () => toast.error('Could not vote.'),
  })

  const unvoteMutation = useMutation({
    mutationFn: (id: string) => suggestionsApi.unvote(id),
    onSuccess: (updated) => {
      qc.setQueryData(['suggestions'], (old: typeof data) => {
        if (!old) return old
        return { ...old, content: old.content.map((s) => s.id === updated.id ? updated : s) }
      })
    },
    onError: () => toast.error('Could not remove vote.'),
  })

  const suggestions = data?.content ?? []

  return (
    <div className="flex flex-col gap-6 animate-[page-enter_0.3s_ease-out]">
      {/* ── Atmospheric header ──────────────────────────────────────── */}
      <div
        className="relative -mx-4 -mt-8 overflow-hidden px-4 pt-8 pb-6 sm:-mx-6 sm:px-6"
        style={{
          background:
            'radial-gradient(ellipse at 20% 60%, rgba(56,189,248,0.14) 0%, transparent 50%),' +
            'radial-gradient(ellipse at 75% 25%, rgba(99,102,241,0.10) 0%, transparent 50%),' +
            'radial-gradient(ellipse at 50% 90%, rgba(74,110,232,0.07) 0%, transparent 45%)',
        }}
      >
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
              Community Voice
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Ideas &amp; Suggestions
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Shape campus life. Submit ideas and vote for what matters most.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="mt-1 shrink-0">
            + Share Idea
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      {suggestions.length > 0 && (
        <SuggestionsStatsBar
          total={suggestions.length}
          votes={suggestions.reduce((acc, s) => acc + s.voteCount, 0)}
          inProgress={suggestions.filter((s) => s.status !== 'OPEN').length}
        />
      )}

      {/* Suggestions list */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <EmptyState
          icon="💡"
          title="No ideas yet"
          description="Be the first to suggest an improvement!"
          action={<Button onClick={() => setShowForm(true)}>Share Idea</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {suggestions.map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              onVote={(id) => voteMutation.mutate(id)}
              onUnvote={(id) => unvoteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Post form modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Share an Idea">
        <div className="flex flex-col gap-4">
          <div>
            <Input
              label="Title"
              placeholder="One clear sentence about your idea"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
            />
            <p className={cn('mt-1 text-right text-xs', title.length >= 90 ? 'text-danger' : 'text-muted-foreground')}>
              {title.length}/100
            </p>
          </div>
          <div>
            <Textarea
              label="Description"
              placeholder="Explain the problem it solves and how it would work..."
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              rows={4}
            />
            <p className={cn('mt-1 text-right text-xs', description.length >= 450 ? 'text-danger' : 'text-muted-foreground')}>
              {description.length}/500
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              isLoading={createMutation.isPending}
              disabled={!title.trim() || !description.trim()}
              className="flex-1"
            >
              Post Idea
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
