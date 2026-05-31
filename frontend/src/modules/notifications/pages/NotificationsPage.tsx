import { useState } from 'react'
import { Button, EmptyState, Pagination } from '@/shared/components/ui'
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../hooks/useNotifications'
import { NotificationItem } from '../components/NotificationItem'
import { useThemeStore } from '@/shared/store/themeStore'
import { cn } from '@/shared/lib/cn'

export function NotificationsPage() {
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const [page, setPage] = useState(0)
  const { data, isLoading } = useNotifications(page)
  const markAsRead         = useMarkAsRead()
  const markAllAsRead      = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()

  const notifications = data?.content ?? []
  const unreadCount   = notifications.filter((n) => !n.read).length

  return (
    <div className="mx-auto max-w-2xl animate-[page-enter_0.3s_ease-out]">

      {/* ── EDITORIAL HEADER ─────────────────────────────────────── */}
      <div
        className="relative -mx-4 -mt-8 mb-6 overflow-hidden px-4 pt-8 pb-6 sm:-mx-6 sm:px-6"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 25% 60%, rgba(74,110,232,0.10) 0%, transparent 55%), #0a0d14'
            : 'radial-gradient(ellipse at 25% 60%, rgba(74,110,232,0.08) 0%, transparent 55%), #f7f8fa',
        }}
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
              Activity
            </p>
            <h1 className={cn(
              'text-3xl font-black leading-none tracking-tight sm:text-4xl',
              isDark ? 'text-white' : 'text-foreground',
            )}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-bold text-primary">{unreadCount}</span> unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              isLoading={markAllAsRead.isPending}
              className="shrink-0"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Bottom rule */}
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 h-px"
          aria-hidden="true"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(74,110,232,0.25) 40%, transparent 100%)',
          }}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="You're all caught up"
          description="New activity like reservations, followers, and campus updates will appear here."
          icon={
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      ) : (
        <div
          className={cn(
            'overflow-hidden rounded-2xl border divide-y',
            isDark ? 'border-white/8 divide-white/5 bg-white/[0.02]' : 'border-border divide-border bg-surface',
          )}
          role="list"
          aria-label="Notifications"
        >
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkAsRead={(id) => markAsRead.mutate(id)}
              onDelete={(id) => deleteNotification.mutate(id)}
            />
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            page={data.number}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
