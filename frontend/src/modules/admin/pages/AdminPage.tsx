import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/shared/store/authStore'
import { Navigate } from 'react-router-dom'
import { paths } from '@/shared/routes/paths'
import { apiClient } from '@/shared/lib/apiClient'
import type { Page } from '@/shared/lib/types'
import { toast } from '@/shared/store/toastStore'
import { cn } from '@/shared/lib/cn'
import { announcementsApi } from '@/modules/announcements/services/announcementsApi'
import type { Announcement } from '@/modules/announcements/types'
import { useThemeStore } from '@/shared/store/themeStore'
import { reportsApi } from '@/modules/reports/services/reportsApi'
import type { ReportResponse } from '@/modules/reports/services/reportsApi'

interface UserRow {
  id: string
  email: string
  fullName: string
  role: string
  status: string
  suspendedUntil: string | null
  suspendCount: number
  suspensionReason: string | null
}

type AdminTab = 'users' | 'announcements' | 'reports'

const ROLE_STYLES: Record<string, { pill: string; dot: string }> = {
  ROLE_ADMIN:   { pill: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',     dot: 'bg-red-500'    },
  ROLE_FACULTY: { pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dot: 'bg-blue-500'   },
  ROLE_STUDENT: { pill: 'bg-surface-muted text-muted-foreground',                            dot: 'bg-gray-400'   },
}

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  ACTIVE:               { pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
  PENDING_VERIFICATION: { pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',         dot: 'bg-amber-500'   },
  SUSPENDED:            { pill: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',                 dot: 'bg-red-500'     },
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

function UsersTab() {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const qc     = useQueryClient()

  // Suspend modal state
  const [suspendTarget, setSuspendTarget] = useState<UserRow | null>(null)
  const [suspendUntil,  setSuspendUntil]  = useState('')
  const [suspendReason, setSuspendReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn:  (): Promise<Page<UserRow>> =>
      apiClient.get('/admin/users').then((r) => r.data.data),
    staleTime: 30_000,
  })

  const suspendMutation = useMutation({
    mutationFn: ({ id, suspendedUntil, reason }: { id: string; suspendedUntil: string | null; reason: string | null }) =>
      apiClient.patch(`/admin/users/${id}/suspend`, { suspendedUntil, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User suspended.')
      setSuspendTarget(null)
      setSuspendUntil('')
      setSuspendReason('')
    },
    onError: () => toast.error('Could not suspend user.'),
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/users/${id}/reactivate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User reactivated.')
    },
    onError: () => toast.error('Could not reactivate user.'),
  })

  const users          = data?.content ?? []
  const activeCount    = users.filter((u) => u.status === 'ACTIVE').length
  const pendingCount   = users.filter((u) => u.status === 'PENDING_VERIFICATION').length
  const suspendedCount = users.filter((u) => u.status === 'SUSPENDED').length

  const handleSuspendSubmit = () => {
    if (!suspendTarget) return
    suspendMutation.mutate({
      id: suspendTarget.id,
      suspendedUntil: suspendUntil || null,
      reason: suspendReason.trim() || null,
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Quick stats */}
      {!isLoading && users.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Users', value: users.length,   accent: '#4a6ee8' },
            { label: 'Active',      value: activeCount,    accent: '#10b981' },
            { label: 'Pending',     value: pendingCount,   accent: '#f59e0b' },
            { label: 'Suspended',   value: suspendedCount, accent: '#ef4444' },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className={cn(
                'rounded-xl border p-4 text-center',
                isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface',
              )}
            >
              <p className="font-mono text-2xl font-black tabular-nums" style={{ color: accent }}>
                {value}
              </p>
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div
        className={cn(
          'overflow-hidden rounded-2xl border',
          isDark ? 'border-white/8' : 'border-border',
        )}
      >
        <div
          className={cn(
            'grid grid-cols-[1fr_auto_auto_auto] gap-3 border-b px-4 py-3',
            isDark ? 'border-white/6 bg-white/[0.03]' : 'border-border bg-surface-muted',
          )}
        >
          {['User', 'Role', 'Status', 'Actions'].map((h, i) => (
            <p
              key={h}
              className={cn(
                'text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground',
                i === 3 && 'text-right',
              )}
            >
              {h}
            </p>
          ))}
        </div>

        {isLoading ? (
          <div className={cn(isDark ? 'bg-white/[0.02]' : 'bg-surface')}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 border-b border-border px-4 py-3.5 last:border-0">
                <div className="skeleton h-5 rounded" />
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-5 w-16 rounded-full" />
                <div />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className={cn('px-4 py-10 text-center text-sm text-muted-foreground', isDark ? 'bg-white/[0.02]' : 'bg-surface')}>
            No users found.
          </div>
        ) : (
          <div className={isDark ? 'bg-white/[0.02]' : 'bg-surface'}>
            {users.map((user, idx) => {
              const roleStyle   = ROLE_STYLES[user.role]    ?? ROLE_STYLES.ROLE_STUDENT
              const statusStyle = STATUS_STYLES[user.status] ?? STATUS_STYLES.ACTIVE
              return (
                <div
                  key={user.id}
                  className={cn(
                    'grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-3.5 transition-colors',
                    isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-surface-muted/50',
                    idx < users.length - 1 && 'border-b border-border',
                  )}
                >
                  {/* Name + email */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{user.fullName}</p>
                      {user.suspendCount > 0 && (
                        <span
                          className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
                          title={`Suspended ${user.suspendCount} time(s)`}
                        >
                          ×{user.suspendCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>

                  {/* Role */}
                  <div>
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold', roleStyle.pill)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', roleStyle.dot)} />
                      {user.role.replace('ROLE_', '')}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold', statusStyle.pill)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', statusStyle.dot)} />
                      {user.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-1.5">
                    {user.status === 'SUSPENDED' ? (
                      <button
                        onClick={() => reactivateMutation.mutate(user.id)}
                        className="rounded-lg border border-emerald-400/25 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 transition-all hover:bg-emerald-500/8 hover:border-emerald-400/40"
                      >
                        Reactivate
                      </button>
                    ) : (
                      user.role !== 'ROLE_ADMIN' && (
                        <button
                          onClick={() => { setSuspendTarget(user); setSuspendUntil(''); setSuspendReason('') }}
                          className="rounded-lg border border-danger/25 px-2.5 py-1 text-[10px] font-bold text-danger transition-all hover:bg-danger/8 hover:border-danger/40"
                        >
                          Suspend
                        </button>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Suspend Modal */}
      {suspendTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(4,7,18,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSuspendTarget(null) }}
        >
          <div
            className={cn(
              'w-full max-w-md overflow-hidden rounded-2xl border',
              isDark ? 'border-white/10 bg-[#12141a]' : 'border-border bg-white',
            )}
          >
            {/* Header */}
            <div
              className={cn(
                'flex items-center gap-3 border-b px-5 py-4',
                isDark ? 'border-white/8' : 'border-border',
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(239,68,68,0.12)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Suspend User</p>
                <p className="text-[11px] text-muted-foreground">{suspendTarget.fullName}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 p-5">
              {/* Suspend until */}
              <div>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Suspend Until (optional — leave blank for indefinite)
                </label>
                <input
                  type="datetime-local"
                  value={suspendUntil}
                  onChange={(e) => setSuspendUntil(e.target.value)}
                  className={cn(
                    'w-full rounded-xl border px-3.5 py-2.5 text-sm text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-danger/20 focus:border-danger/50',
                    isDark ? 'border-white/10 bg-white/[0.04]' : 'border-border bg-surface-muted',
                  )}
                />
              </div>

              {/* Reason */}
              <div>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Reason (optional)
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Violated community guidelines…"
                  className={cn(
                    'w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-danger/20 focus:border-danger/50',
                    isDark ? 'border-white/10 bg-white/[0.04]' : 'border-border bg-surface-muted',
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setSuspendTarget(null)}
                  className={cn(
                    'flex-1 rounded-xl border px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground',
                    isDark ? 'border-white/12' : 'border-border',
                  )}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSuspendSubmit}
                  disabled={suspendMutation.isPending}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}
                >
                  {suspendMutation.isPending ? 'Suspending…' : 'Confirm Suspend'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Announcements Tab ─────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<string, { label: string; border: string; bg: string; pill: string; accent: string }> = {
  CRITICAL:  { label: 'Critical',  border: 'border-red-300 dark:border-red-800/60',      bg: 'dark:bg-red-950/15',    pill: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',      accent: '#ef4444' },
  IMPORTANT: { label: 'Important', border: 'border-amber-300 dark:border-amber-800/60',  bg: 'dark:bg-amber-950/15',  pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', accent: '#f59e0b' },
  GENERAL:   { label: 'General',   border: 'border-border',                               bg: '',                      pill: 'bg-surface-muted text-muted-foreground',                              accent: '#4a6ee8' },
}

function AnnouncementsTab() {
  const qc = useQueryClient()
  const [showForm, setShowForm]  = useState(false)
  const [title, setTitle]        = useState('')
  const [body, setBody]          = useState('')
  const [priority, setPriority]  = useState<import('@/modules/announcements/types').AnnouncementPriority>('GENERAL')
  const isDark = useThemeStore((s) => s.theme === 'dark')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn:  () => announcementsApi.getAll(),
    staleTime: 30_000,
  })

  const createMutation = useMutation({
    mutationFn: () => announcementsApi.create({ title, body, priority, expiresAt: null, imageUrl: null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      qc.invalidateQueries({ queryKey: ['announcements', 'active'] })
      toast.success('Announcement posted!')
      setShowForm(false)
      setTitle('')
      setBody('')
      setPriority('GENERAL')
    },
    onError: () => toast.error('Failed to post announcement.'),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      qc.invalidateQueries({ queryKey: ['announcements', 'active'] })
      toast.success('Announcement deactivated.')
    },
    onError: () => toast.error('Could not deactivate.'),
  })

  const announcements = data?.content ?? []

  return (
    <div className="flex flex-col gap-4">
      {/* New announcement form */}
      {showForm ? (
        <div
          className={cn(
            'overflow-hidden rounded-2xl border',
            isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface',
          )}
        >
          <div
            className="flex items-center gap-3 border-b px-5 py-4"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'rgba(31,58,138,0.10)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a6ee8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-foreground">New Announcement</p>
          </div>

          <div className="flex flex-col gap-3 p-5">
            {/* Priority selector */}
            <div className="flex gap-2 p-1 rounded-xl bg-surface-muted">
              {(['GENERAL', 'IMPORTANT', 'CRITICAL'] as const).map((p) => {
                const cfg = PRIORITY_CONFIG[p]
                const isActive = priority === p
                return (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className="flex-1 rounded-lg py-2 text-xs font-bold transition-all"
                    style={isActive ? {
                      background: `${cfg.accent}18`,
                      color: cfg.accent,
                      border: `1px solid ${cfg.accent}40`,
                    } : {
                      color: isDark ? '#99a1b3' : '#5b6472',
                    }}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>

            <input
              className={cn(
                'w-full rounded-xl border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground',
                'bg-surface-muted border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
              )}
              placeholder="Announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className={cn(
                'w-full rounded-xl border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none',
                'bg-surface-muted border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
              )}
              placeholder="Message body"
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowForm(false)}
                className={cn(
                  'flex-1 rounded-xl border px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground',
                  isDark ? 'border-white/12' : 'border-border',
                )}
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!title.trim() || !body.trim() || createMutation.isPending}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {createMutation.isPending ? 'Posting…' : 'Post Announcement'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className={cn(
            'flex items-center gap-2 rounded-xl border border-dashed px-4 py-3.5 text-sm font-medium transition-colors',
            isDark
              ? 'border-white/12 text-muted-foreground hover:border-primary/50 hover:text-primary'
              : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary',
          )}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Announcement
        </button>
      )}

      {/* List */}
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))
      ) : announcements.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No announcements yet. Create one above.
        </div>
      ) : (
        announcements.map((a: Announcement) => {
          const cfg = PRIORITY_CONFIG[a.priority] ?? PRIORITY_CONFIG.GENERAL
          return (
            <div
              key={a.id}
              className={cn(
                'flex items-start justify-between gap-3 rounded-2xl border p-4 transition-all',
                'bg-surface',
                cfg.border, cfg.bg,
                !a.active && 'opacity-50',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em]', cfg.pill)}>
                    {cfg.label}
                  </span>
                  {!a.active && (
                    <span className="text-[10px] font-medium text-muted-foreground">(inactive)</span>
                  )}
                </div>
                <p className="text-sm font-bold text-foreground">{a.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{a.body}</p>
              </div>
              {a.active && (
                <button
                  onClick={() => deactivateMutation.mutate(a.id)}
                  className="shrink-0 rounded-lg border border-danger/20 px-2.5 py-1 text-[10px] font-bold text-danger transition-all hover:bg-danger/8 hover:border-danger/40"
                >
                  Deactivate
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

// ── Reports Tab ──────────────────────────────────────────────────────────────

function ReportsTab() {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => reportsApi.getAll(),
    staleTime: 30_000,
  })

  const closeMutation = useMutation({
    mutationFn: (id: string) => reportsApi.close(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reports'] })
      toast.success('Report closed.')
    },
  })

  const reports = data?.content ?? []

  const CATEGORY_LABELS: Record<string, string> = {
    HARASSMENT: 'Harassment',
    SPAM: 'Spam',
    INAPPROPRIATE: 'Inappropriate',
    FRAUD: 'Fraud / Scam',
    HATE_SPEECH: 'Hate Speech',
    OTHER: 'Other',
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{reports.filter((r) => r.status === 'OPEN').length}</span> open · {reports.length} total
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm text-muted-foreground">No reports yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report: ReportResponse) => (
            <div
              key={report.id}
              className={cn(
                'rounded-2xl border p-4 transition-all',
                isDark ? 'border-white/8 bg-white/[0.02]' : 'border-border bg-surface',
                report.status === 'CLOSED' && 'opacity-50',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider',
                      report.status === 'OPEN'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-surface-muted text-muted-foreground',
                    )}>
                      {report.status}
                    </span>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {CATEGORY_LABELS[report.category] ?? report.category}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{report.subject}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    By <span className="font-semibold text-foreground">{report.reporterName}</span> · {new Date(report.createdAt).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' })}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{report.description}</p>
                </div>
                {report.status === 'OPEN' && (
                  <button
                    onClick={() => closeMutation.mutate(report.id)}
                    disabled={closeMutation.isPending}
                    className="shrink-0 rounded-lg border border-emerald-300/30 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 transition-all hover:bg-emerald-500/8"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

const TABS: { value: AdminTab; label: string; icon: React.ReactNode }[] = [
  {
    value: 'users',
    label: 'Users',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    value: 'announcements',
    label: 'Announcements',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      </svg>
    ),
  },
  {
    value: 'reports' as AdminTab,
    label: 'Reports',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
]

export function AdminPage() {
  const user    = useAuthStore((s) => s.user)
  const isDark  = useThemeStore((s) => s.theme === 'dark')
  const [tab, setTab] = useState<AdminTab>('users')

  if (!user || user.role !== 'ROLE_ADMIN') {
    return <Navigate to={paths.dashboard} replace />
  }

  return (
    <div className="flex flex-col gap-6 animate-[page-enter_0.3s_ease-out]">

      {/* ── EDITORIAL HERO ─────────────────────────────────────────── */}
      <div
        className="relative -mx-4 -mt-8 overflow-hidden sm:-mx-6"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 15% 60%, rgba(220,38,38,0.10) 0%, transparent 50%), radial-gradient(ellipse at 80% 25%, rgba(31,58,138,0.12) 0%, transparent 55%), #0a0d14'
            : 'radial-gradient(ellipse at 15% 60%, rgba(220,38,38,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 25%, rgba(31,58,138,0.10) 0%, transparent 55%), #f7f8fa',
        }}
      >
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.10] dark:opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(220,38,38,0.5) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Large BG letter */}
        <div
          className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none text-[160px] font-black leading-none opacity-[0.03]"
          aria-hidden="true"
          style={{ color: isDark ? '#fff' : '#dc2626' }}
        >
          A
        </div>

        <div className="relative z-10 px-4 pt-8 pb-6 sm:px-6">
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-red-600 dark:text-red-400">
            Control Center
          </p>
          <h1 className={cn(
            'text-4xl font-black leading-none tracking-tight sm:text-5xl',
            isDark ? 'text-white' : 'text-foreground',
          )}>
            Admin Panel
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage users and publish campus announcements.
          </p>
        </div>

        {/* Bottom rule */}
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 h-px"
          aria-hidden="true"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(220,38,38,0.4) 35%, rgba(31,58,138,0.3) 65%, transparent 100%)',
          }}
        />
      </div>

      {/* ── TABS ────────────────────────────────────────────────────── */}
      <div
        className="flex gap-1 rounded-xl border p-1"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all"
            style={tab === t.value ? {
              background: isDark ? 'rgba(255,255,255,0.08)' : 'white',
              color: 'var(--color-foreground)',
              boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.1)',
            } : {
              color: isDark ? '#99a1b3' : '#5b6472',
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ────────────────────────────────────────────── */}
      {tab === 'users'         && <UsersTab />}
      {tab === 'announcements' && <AnnouncementsTab />}
      {tab === 'reports'       && <ReportsTab />}
    </div>
  )
}
