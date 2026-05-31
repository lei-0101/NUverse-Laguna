import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useThemeStore } from '@/shared/store/themeStore'
import { cn } from '@/shared/lib/cn'
import { toast } from '@/shared/store/toastStore'
import { reportsApi } from '@/modules/reports/services/reportsApi'

const CATEGORIES = [
  { value: 'HARASSMENT',    label: 'Harassment or Bullying' },
  { value: 'SPAM',          label: 'Spam or Misleading Content' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate Content' },
  { value: 'FRAUD',         label: 'Fraud or Scam' },
  { value: 'HATE_SPEECH',   label: 'Hate Speech' },
  { value: 'OTHER',         label: 'Other' },
]

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  targetType?: string
  targetId?: string
  targetLabel?: string
}

export function ReportModal({ isOpen, onClose, targetType, targetId, targetLabel }: ReportModalProps) {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const [subject,     setSubject]     = useState('')
  const [category,    setCategory]    = useState('OTHER')
  const [description, setDescription] = useState('')

  const submitMutation = useMutation({
    mutationFn: () => reportsApi.submit({ subject, category, description, targetType, targetId }),
    onSuccess: () => {
      toast.success('Report submitted. Our team will review it.')
      onClose()
      setSubject('')
      setCategory('OTHER')
      setDescription('')
    },
    onError: () => toast.error('Could not submit report. Try again.'),
  })

  if (!isOpen) return null

  const canSubmit = subject.trim().length > 0 && description.trim().length > 0 && !submitMutation.isPending

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(4,7,18,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={cn('w-full max-w-md overflow-hidden rounded-2xl border', isDark ? 'border-white/10 bg-[#12141a]' : 'border-border bg-white')}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div
          className={cn('flex items-center gap-3 border-b px-5 py-4', isDark ? 'border-white/8' : 'border-border')}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(239,68,68,0.12)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Submit a Report</p>
            {targetLabel && <p className="text-[11px] text-muted-foreground">About: {targetLabel}</p>}
          </div>
          <button onClick={onClose} className="ml-auto text-muted-foreground hover:text-foreground">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          {/* Category — custom dropdown for full dark-mode compatibility */}
          <div className="relative">
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={cn(
                  'w-full appearance-none rounded-xl border px-3.5 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20',
                  isDark
                    ? 'border-white/10 bg-[#1e2130] text-white [&>option]:bg-[#1e2130] [&>option]:text-white'
                    : 'border-border bg-surface-muted text-foreground',
                )}
                style={{ colorScheme: isDark ? 'dark' : 'light' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M3 5l4 4 4-4" />
              </svg>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Subject <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              placeholder="Brief summary of the issue…"
              className={cn('w-full rounded-xl border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20', isDark ? 'border-white/10 bg-white/[0.04]' : 'border-border bg-surface-muted')}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={5000}
              placeholder="Please describe the issue in detail…"
              className={cn('w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20', isDark ? 'border-white/10 bg-white/[0.04]' : 'border-border bg-surface-muted')}
            />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">{description.length}/5000</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={cn('flex-1 rounded-xl border px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground', isDark ? 'border-white/12' : 'border-border')}
            >
              Cancel
            </button>
            <button
              onClick={() => submitMutation.mutate()}
              disabled={!canSubmit}
              className="flex-1 rounded-xl bg-danger px-4 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {submitMutation.isPending ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
