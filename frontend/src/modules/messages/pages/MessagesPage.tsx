import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { messagesApi } from '../services/messagesApi'
import { useAuthStore } from '@/shared/store/authStore'
import { useThemeStore } from '@/shared/store/themeStore'
import { cn } from '@/shared/lib/cn'
import type { Conversation } from '../types'

function Avatar({ name, src, size = 'sm' }: { name: string; src: string | null; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'h-10 w-10 text-xs' : 'h-8 w-8 text-[11px]'
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  if (src) return <img src={src} alt={name} className={cn('rounded-full object-cover', dim)} />
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white select-none', dim)}
      style={{ background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 60%, #7c3aed 100%)' }}
    >
      {initials}
    </span>
  )
}

function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isDark,
}: {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (conv: Conversation) => void
  isDark: boolean
}) {
  return (
    <div className="flex flex-col">
      {conversations.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-3xl mb-2">💬</p>
          <p className="text-sm font-semibold text-foreground">No conversations yet</p>
          <p className="text-xs text-muted-foreground mt-1">Message someone from their profile</p>
        </div>
      )}
      {conversations.map((conv) => {
        const isActive = conv.id === selectedId
        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={cn(
              'flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b',
              isDark ? 'border-white/5' : 'border-border/50',
              isActive
                ? isDark ? 'bg-primary/12' : 'bg-primary/6'
                : isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-surface-muted',
            )}
          >
            <div className="relative shrink-0">
              <Avatar name={conv.otherUserName} src={conv.otherUserAvatar} />
              {conv.unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white">
                  {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn('text-sm font-bold truncate', isActive ? 'text-primary' : 'text-foreground')}>
                {conv.otherUserName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {conv.lastMessage ?? 'Say hello 👋'}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function ChatArea({
  conversation,
  currentUserId,
  isDark,
}: {
  conversation: Conversation
  currentUserId: string
  isDark: boolean
}) {
  const qc = useQueryClient()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: msgPage } = useQuery({
    queryKey: ['messages', conversation.id],
    queryFn: () => messagesApi.getMessages(conversation.id),
    refetchInterval: 3000,
  })

  const messages = msgPage?.content ?? []

  const sendMutation = useMutation({
    mutationFn: (body: string) => messagesApi.send(conversation.id, body),
    onSuccess: (newMsg) => {
      qc.setQueryData(['messages', conversation.id], (old: typeof msgPage) => {
        if (!old) return old
        return { ...old, content: [...old.content, newMsg] }
      })
      qc.invalidateQueries({ queryKey: ['messages', 'conversations'] })
      setText('')
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || sendMutation.isPending) return
    sendMutation.mutate(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        'flex items-center gap-3 border-b px-4 py-3.5 shrink-0',
        isDark ? 'border-white/8' : 'border-border',
      )}>
        <Avatar name={conversation.otherUserName} src={conversation.otherUserAvatar} size="md" />
        <div>
          <p className="text-sm font-bold text-foreground">{conversation.otherUserName}</p>
          <p className="text-[11px] text-muted-foreground">Direct Message</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId
          const time = new Date(msg.createdAt).toLocaleTimeString('en-PH', {
            hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila',
          })
          return (
            <div key={msg.id} className={cn('flex gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}>
              {!isMe && (
                <Avatar name={msg.senderName} src={conversation.otherUserAvatar} />
              )}
              <div className={cn('max-w-[70%] flex flex-col gap-1', isMe && 'items-end')}>
                <div
                  className={cn(
                    'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    isMe
                      ? 'rounded-br-sm text-white'
                      : isDark
                        ? 'bg-white/8 text-white rounded-bl-sm'
                        : 'bg-surface-muted text-foreground rounded-bl-sm',
                  )}
                  style={isMe ? { background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 100%)' } : undefined}
                >
                  {msg.body}
                </div>
                <span className="text-[10px] text-muted-foreground">{time}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={cn(
        'flex items-end gap-2 border-t px-4 py-3 shrink-0',
        isDark ? 'border-white/8' : 'border-border',
      )}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          className={cn(
            'flex-1 resize-none rounded-2xl border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground',
            'transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
            isDark ? 'border-white/10 bg-white/[0.04]' : 'border-border bg-surface-muted',
          )}
          style={{ maxHeight: 120 }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
          style={{ background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 100%)', boxShadow: '0 2px 12px rgba(74,110,232,0.4)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function MessagesPage() {
  const isDark  = useThemeStore((s) => s.theme === 'dark')
  const user    = useAuthStore((s) => s.user)
  const location = useLocation()
  const [selected, setSelected] = useState<Conversation | null>(null)

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['messages', 'conversations'],
    queryFn: messagesApi.getConversations,
    refetchInterval: 5000,
  })

  // Auto-select conversation from navigation state
  useEffect(() => {
    const targetId = (location.state as { conversationId?: string } | null)?.conversationId
    if (targetId && conversations.length > 0 && !selected) {
      const conv = conversations.find((c) => c.id === targetId)
      if (conv) setSelected(conv)
    }
  }, [location.state, conversations, selected])

  return (
    <div className="flex flex-col gap-0 animate-[page-enter_0.3s_ease-out]">
      {/* Header */}
      <div
        className="relative -mx-4 -mt-8 mb-0 overflow-hidden px-4 pt-8 pb-4 sm:-mx-6 sm:px-6"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 20% 60%, rgba(74,110,232,0.12) 0%, transparent 55%), #0a0d14'
            : 'radial-gradient(ellipse at 20% 60%, rgba(74,110,232,0.08) 0%, transparent 55%), #f7f8fa',
        }}
      >
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
          Direct Messages
        </p>
        <h1 className={cn('text-3xl font-black leading-none tracking-tight sm:text-4xl', isDark ? 'text-white' : 'text-foreground')}>
          Messages
        </h1>
      </div>

      {/* Chat layout */}
      <div
        className={cn(
          'overflow-hidden rounded-2xl border',
          isDark ? 'border-white/8' : 'border-border',
        )}
        style={{ height: 'calc(100vh - 220px)', minHeight: 400, display: 'flex' }}
      >
        {/* Sidebar */}
        <div
          className={cn(
            'w-72 shrink-0 overflow-y-auto border-r',
            isDark ? 'border-white/8' : 'border-border',
            selected && 'hidden sm:block',
          )}
        >
          <div className={cn('px-4 py-3 border-b text-xs font-bold text-muted-foreground uppercase tracking-wider', isDark ? 'border-white/5' : 'border-border')}>
            Conversations
          </div>
          {isLoading ? (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-3 w-32 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
              isDark={isDark}
            />
          )}
        </div>

        {/* Main chat area */}
        <div className="flex-1 overflow-hidden">
          {selected && user ? (
            <ChatArea
              conversation={selected}
              currentUserId={user.id}
              isDark={isDark}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center p-8">
              <div className="text-5xl mb-2">💬</div>
              <p className="text-lg font-black text-foreground">Start a Conversation</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Select a conversation from the sidebar, or go to someone's profile and click <strong>Message</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
