import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementsApi } from '../services/announcementsApi'
import { useAuthStore } from '@/shared/store/authStore'
import { useThemeStore } from '@/shared/store/themeStore'
import { cn } from '@/shared/lib/cn'
import { paths, announcementDetailPath } from '@/shared/routes/paths'
import { toast } from '@/shared/store/toastStore'
import type { AnnouncementPriority } from '../types'
import { Navigate } from 'react-router-dom'

const PRIORITY_CONFIG = {
  GENERAL:   { label: 'General',   accent: '#4a6ee8', icon: '📌' },
  IMPORTANT: { label: 'Important', accent: '#f59e0b', icon: '📣' },
  CRITICAL:  { label: 'Critical',  accent: '#ef4444', icon: '🚨' },
} as const

export function EditAnnouncementPage() {
  const { announcementId = '' } = useParams()
  const isDark   = useThemeStore((s) => s.theme === 'dark')
  const user     = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const qc       = useQueryClient()

  const canManage = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_FACULTY'
  if (!canManage) return <Navigate to={paths.announcements} replace />

  const { data: ann, isLoading } = useQuery({
    queryKey: ['announcement', announcementId],
    queryFn:  () => announcementsApi.getById(announcementId),
    enabled:  !!announcementId,
  })

  const [title,     setTitle]     = useState('')
  const [body,      setBody]      = useState('')
  const [priority,  setPriority]  = useState<AnnouncementPriority>('GENERAL')
  const [expiresAt, setExpiresAt] = useState('')
  const [imageUrl,  setImageUrl]  = useState('')

  useEffect(() => {
    if (!ann) return
    setTitle(ann.title)
    setBody(ann.body)
    setPriority(ann.priority)
    setImageUrl(ann.imageUrl ?? '')
    if (ann.expiresAt) {
      const d = new Date(ann.expiresAt)
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 16)
      setExpiresAt(local)
    }
  }, [ann])

  const updateMutation = useMutation({
    mutationFn: () =>
      announcementsApi.update(announcementId, {
        title:     title.trim(),
        body:      body.trim(),
        priority,
        expiresAt: expiresAt ? expiresAt : null,
        imageUrl:  imageUrl.trim() || null,
      }),
    onSuccess: (updated) => {
      qc.setQueryData(['announcement', announcementId], updated)
      qc.invalidateQueries({ queryKey: ['announcements', 'browse'] })
      qc.invalidateQueries({ queryKey: ['announcements', 'active'] })
      toast.success('Announcement updated.')
      navigate(announcementDetailPath(announcementId))
    },
    onError: () => toast.error('Failed to update announcement.'),
  })

  if (isLoading) return (
    <div className="mx-auto max-w-2xl space-y-4 animate-[page-enter_0.3s_ease-out]">
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton h-10 w-3/4 rounded-xl" />
      <div className="skeleton h-40 w-full rounded-2xl" />
    </div>
  )

  if (!ann) return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-6xl">📭</p>
      <p className="text-lg font-bold text-foreground">Announcement not found</p>
      <Link to={paths.announcements} className="text-sm font-semibold text-primary hover:underline">
        ← Back to announcements
      </Link>
    </div>
  )

  const canSave = title.trim().length > 0 && body.trim().length > 0 && !updateMutation.isPending

  return (
    <div className="mx-auto max-w-2xl animate-[page-enter_0.3s_ease-out]">

      {/* Back nav */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={announcementDetailPath(announcementId)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 2L4 7l5 5" />
          </svg>
          Back
        </Link>
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">
          Edit Announcement
        </p>
      </div>

      {/* Form card */}
      <div
        className={cn(
          'overflow-hidden rounded-2xl border',
          isDark ? 'border-white/8 bg-[#1a1d24]' : 'border-border bg-white',
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center gap-3 border-b px-6 py-4',
            isDark ? 'border-white/6' : 'border-border',
          )}
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: 'rgba(74,110,232,0.12)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a6ee8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Edit Announcement</p>
            <p className="text-[11px] text-muted-foreground">Changes notify all users</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-6">

          {/* Priority selector */}
          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Priority
            </label>
            <div className="flex gap-2 rounded-xl bg-surface-muted p-1">
              {(['GENERAL', 'IMPORTANT', 'CRITICAL'] as const).map((p) => {
                const cfg = PRIORITY_CONFIG[p]
                const isActive = priority === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all"
                    style={isActive ? {
                      background: `${cfg.accent}18`,
                      color: cfg.accent,
                      border: `1px solid ${cfg.accent}40`,
                    } : {
                      color: isDark ? '#8a90a0' : '#6b7280',
                    }}
                  >
                    <span className="text-sm">{cfg.icon}</span>
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Announcement title…"
              className={cn(
                'w-full rounded-xl border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground',
                'transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                isDark
                  ? 'border-white/10 bg-white/[0.04] focus:border-white/20'
                  : 'border-border bg-surface-muted focus:bg-white',
              )}
            />
            <p className="mt-1 text-[11px] text-muted-foreground text-right">{title.length}/200</p>
          </div>

          {/* Body */}
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Message <span className="text-danger">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Write your announcement message…"
              className={cn(
                'w-full resize-none rounded-xl border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground',
                'transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                isDark
                  ? 'border-white/10 bg-white/[0.04] focus:border-white/20'
                  : 'border-border bg-surface-muted focus:bg-white',
              )}
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Image URL <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={cn(
                'w-full rounded-xl border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground',
                'transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                isDark
                  ? 'border-white/10 bg-white/[0.04] focus:border-white/20'
                  : 'border-border bg-surface-muted focus:bg-white',
              )}
            />
            {imageUrl && (
              <div className="mt-2 overflow-hidden rounded-xl border border-border">
                <img src={imageUrl} alt="Preview" className="h-32 w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
          </div>

          {/* Expiry datetime */}
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Expiry Date &amp; Time <span className="text-muted-foreground">(optional — auto-archives)</span>
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className={cn(
                'w-full rounded-xl border px-4 py-3 text-sm text-foreground',
                'transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                isDark
                  ? 'border-white/10 bg-white/[0.04] focus:border-white/20'
                  : 'border-border bg-surface-muted focus:bg-white',
              )}
            />
          </div>

          {/* Actions */}
          <div className={cn(
            'flex gap-3 pt-2 border-t',
            isDark ? 'border-white/6' : 'border-border',
          )}>
            <Link
              to={announcementDetailPath(announcementId)}
              className={cn(
                'flex-1 rounded-xl border px-4 py-3 text-center text-sm font-bold text-muted-foreground transition-colors hover:text-foreground',
                isDark ? 'border-white/12' : 'border-border',
              )}
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => updateMutation.mutate()}
              disabled={!canSave}
              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition-all hover:bg-primary-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
              style={{ boxShadow: canSave ? '0 4px 16px rgba(74,110,232,0.35)' : undefined }}
            >
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
