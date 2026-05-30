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

interface UserRow {
  id: string
  email: string
  fullName: string
  role: string
  status: string
}

type AdminTab = 'users' | 'announcements'

const ROLE_STYLES: Record<string, string> = {
  ROLE_ADMIN:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ROLE_FACULTY: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ROLE_STUDENT: 'bg-surface-muted text-muted-foreground',
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PENDING_VERIFICATION: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  SUSPENDED:           'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

function UsersTab() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: (): Promise<Page<UserRow>> =>
      apiClient.get('/admin/users').then((r) => r.data.data),
    staleTime: 30_000,
  })

  const suspendMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/users/${id}/suspend`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User suspended.')
    },
    onError: () => toast.error('Could not suspend user.'),
  })

  const users = data?.content ?? []

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">User</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={4} className="px-4 py-3">
                  <div className="skeleton h-5 rounded" />
                </td>
              </tr>
            ))
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">No users found.</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', ROLE_STYLES[user.role] ?? 'bg-surface-muted text-muted-foreground')}>
                    {user.role.replace('ROLE_', '')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_STYLES[user.status] ?? '')}>
                    {user.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {user.status !== 'SUSPENDED' && user.role !== 'ROLE_ADMIN' && (
                    <button
                      onClick={() => suspendMutation.mutate(user.id)}
                      className="rounded px-2 py-1 text-xs text-danger hover:bg-danger/10 transition-colors"
                    >
                      Suspend
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function AnnouncementsTab() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [priority, setPriority] = useState('GENERAL')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: () => announcementsApi.getAll(),
    staleTime: 30_000,
  })

  const createMutation = useMutation({
    mutationFn: () => announcementsApi.create({ title, body, priority }),
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

  const PRIORITY_BG: Record<string, string> = {
    CRITICAL:  'border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800',
    IMPORTANT: 'border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800',
    GENERAL:   'border-border bg-surface',
  }

  return (
    <div className="flex flex-col gap-4">
      {showForm ? (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="mb-4 text-base font-semibold">New Announcement</h3>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              {(['GENERAL', 'IMPORTANT', 'CRITICAL'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    'flex-1 rounded-lg border py-2 text-sm font-medium transition-all',
                    priority === p
                      ? p === 'CRITICAL' ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                        : p === 'IMPORTANT' ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                        : 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <input
              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Message body"
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!title.trim() || !body.trim() || createMutation.isPending}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {createMutation.isPending ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          + New Announcement
        </button>
      )}

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)
      ) : announcements.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No announcements yet.</p>
      ) : (
        announcements.map((a: Announcement) => (
          <div
            key={a.id}
            className={cn('rounded-2xl border p-4', PRIORITY_BG[a.priority] ?? 'border-border bg-surface', !a.active && 'opacity-50')}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{a.priority}</span>
                  {!a.active && <span className="text-xs text-muted-foreground">(inactive)</span>}
                </div>
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{a.body}</p>
              </div>
              {a.active && (
                <button
                  onClick={() => deactivateMutation.mutate(a.id)}
                  className="shrink-0 rounded px-2 py-1 text-xs text-danger hover:bg-danger/10 transition-colors"
                >
                  Deactivate
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export function AdminPage() {
  const user = useAuthStore((s) => s.user)
  const [tab, setTab] = useState<AdminTab>('users')

  if (!user || user.role !== 'ROLE_ADMIN') {
    return <Navigate to={paths.dashboard} replace />
  }

  return (
    <div className="flex flex-col gap-6 animate-[page-enter_0.3s_ease-out]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage users and campus announcements.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['users', 'announcements'] as AdminTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t === 'users' ? '👥 Users' : '📢 Announcements'}
          </button>
        ))}
      </div>

      {tab === 'users'         && <UsersTab />}
      {tab === 'announcements' && <AnnouncementsTab />}
    </div>
  )
}
