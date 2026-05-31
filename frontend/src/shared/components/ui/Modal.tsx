import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/lib/cn'

interface ModalProps {
  isOpen:    boolean
  onClose:   () => void
  title:     string
  children:  ReactNode
  footer?:   ReactNode
  /** 'sm' = 384px, 'md' = 480px (default), 'lg' = 600px */
  size?:     'sm' | 'md' | 'lg'
  /** Disable closing on backdrop click */
  noBackdropClose?: boolean
}

const sizeMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-[600px]' }

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  noBackdropClose = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  /* Escape key */
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  /* Body scroll lock */
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  /* Focus trap — move focus into dialog when it opens */
  useEffect(() => {
    if (!isOpen) return
    const el = dialogRef.current
    if (!el) return
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusable[0]?.focus()
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ animation: 'page-enter 0.18s ease-out' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={noBackdropClose ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative z-10 w-full rounded-2xl border border-border bg-surface shadow-[var(--shadow-xl)]',
          sizeMap[size],
        )}
        style={{ animation: 'spring-in 0.32s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="modal-title" className="text-base font-semibold text-foreground">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            aria-label="Close dialog"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </header>

        {/* Body */}
        <div className="px-5 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}
