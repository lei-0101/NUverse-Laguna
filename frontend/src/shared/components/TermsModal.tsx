import { useState, useEffect } from 'react'
import { useAuthStore } from '@/shared/store/authStore'
import { useThemeStore } from '@/shared/store/themeStore'
import { cn } from '@/shared/lib/cn'
import { create } from 'zustand'

interface TermsState {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useTermsStore = create<TermsState>((set) => ({
  isOpen: false,
  open:  () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))

/** Opens the T&C modal on every login for STUDENT users. */
export function useTermsCheck() {
  const user   = useAuthStore((s) => s.user)
  const open   = useTermsStore((s) => s.open)

  useEffect(() => {
    if (user?.role === 'ROLE_STUDENT') {
      open()
    }
  }, [user?.id, user?.role, open])
}

export function TermsModal() {
  const isDark  = useThemeStore((s) => s.theme === 'dark')
  const isOpen  = useTermsStore((s) => s.isOpen)
  const close   = useTermsStore((s) => s.close)
  const [read,  setRead]   = useState(false)
  const [scrolled, setScrolled] = useState(false)

  if (!isOpen) return null

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) setScrolled(true)
  }

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,7,18,0.92)', backdropFilter: 'blur(20px)' }}
    >
      <div
        className={cn(
          'w-full max-w-lg overflow-hidden rounded-3xl border',
          isDark ? 'border-white/10 bg-[#0e0f14]' : 'border-border bg-white',
        )}
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div
          className="h-1.5 w-full"
          style={{ background: 'linear-gradient(90deg, #1f3a8a 0%, #4a6ee8 50%, #f5b300 100%)' }}
        />
        <div className={cn(
          'flex items-start gap-4 border-b px-6 py-5',
          isDark ? 'border-white/6' : 'border-border',
        )}>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'rgba(74,110,232,0.12)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a6ee8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <div>
            <h2 className={cn('text-base font-black', isDark ? 'text-white' : 'text-foreground')}>
              NUverse Laguna — Terms, Conditions &amp; Rules
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Please read and agree to continue using the platform.
            </p>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          className={cn(
            'flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed space-y-4',
            isDark ? 'text-white/70' : 'text-muted-foreground',
          )}
          style={{ maxHeight: 380 }}
          onScroll={handleScroll}
        >
          <section>
            <h3 className={cn('mb-1.5 text-xs font-black uppercase tracking-[0.2em]', isDark ? 'text-white' : 'text-foreground')}>
              1. Community Standards
            </h3>
            <p>All users must treat fellow Bulldogs — students, faculty, and staff — with respect and dignity. Harassment, bullying, discrimination, or any form of abusive behavior is strictly prohibited and will result in immediate suspension or permanent ban.</p>
          </section>

          <section>
            <h3 className={cn('mb-1.5 text-xs font-black uppercase tracking-[0.2em]', isDark ? 'text-white' : 'text-foreground')}>
              2. Marketplace Rules
            </h3>
            <p>Items listed in the Marketplace must be accurate in description and pricing. Fraudulent listings, scams, misleading descriptions, or the sale of prohibited items (weapons, illegal substances, counterfeit goods) are strictly banned. Sellers and buyers agree to transact in good faith.</p>
          </section>

          <section>
            <h3 className={cn('mb-1.5 text-xs font-black uppercase tracking-[0.2em]', isDark ? 'text-white' : 'text-foreground')}>
              3. Bulldog Exchange Policy
            </h3>
            <p>Reservations must be honored within the pickup window (48 hours, excluding Sundays). Repeated no-shows or abuse of the reservation system may lead to restrictions. The ₱50 reservation fee is non-refundable unless the reservation expires without fault of the student.</p>
          </section>

          <section>
            <h3 className={cn('mb-1.5 text-xs font-black uppercase tracking-[0.2em]', isDark ? 'text-white' : 'text-foreground')}>
              4. Content & Conduct
            </h3>
            <p>Any content posted — listings, comments, announcements, or lost &amp; found reports — must be relevant, honest, and lawful. Inappropriate content (NSFW, spam, offensive language, misinformation) will be removed and may result in account suspension. Impersonating others is prohibited.</p>
          </section>

          <section>
            <h3 className={cn('mb-1.5 text-xs font-black uppercase tracking-[0.2em]', isDark ? 'text-white' : 'text-foreground')}>
              5. Privacy & Data
            </h3>
            <p>Your personal data (name, email, profile) is used solely for platform functionality within NU Laguna. Do not share sensitive personal information (bank accounts, passwords, ID numbers) through the platform. NUverse Laguna takes no responsibility for off-platform transactions.</p>
          </section>

          <section>
            <h3 className={cn('mb-1.5 text-xs font-black uppercase tracking-[0.2em]', isDark ? 'text-white' : 'text-foreground')}>
              6. Academic Integrity
            </h3>
            <p>The platform must not be used to facilitate academic dishonesty, including the sale or distribution of exam answers, plagiarized work, or any material that violates NU Laguna's academic integrity policies.</p>
          </section>

          <section>
            <h3 className={cn('mb-1.5 text-xs font-black uppercase tracking-[0.2em]', isDark ? 'text-white' : 'text-foreground')}>
              7. Enforcement & Suspension
            </h3>
            <p>Violations of these terms may result in warnings, temporary suspension, or permanent banning at the discretion of platform administrators. Repeated violations will escalate consequences. Users may appeal decisions through the official NU Laguna admin channels.</p>
          </section>

          <section>
            <h3 className={cn('mb-1.5 text-xs font-black uppercase tracking-[0.2em]', isDark ? 'text-white' : 'text-foreground')}>
              8. Ethics & Responsibility
            </h3>
            <p>As NU Laguna Bulldogs, we hold ourselves to high standards of integrity, responsibility, and collegiality. You are personally responsible for all activity conducted under your account. Use this platform to uplift your campus community, not harm it.</p>
          </section>

          {!scrolled && (
            <p className="text-center text-[11px] font-semibold text-muted-foreground animate-pulse">
              ↓ Scroll to read all terms before agreeing
            </p>
          )}
        </div>

        {/* Footer */}
        <div className={cn(
          'flex items-start gap-3 border-t px-6 py-5',
          isDark ? 'border-white/6' : 'border-border',
        )}>
          <label className="flex flex-1 cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={read}
              onChange={(e) => setRead(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
            />
            <span className={cn('text-xs', isDark ? 'text-white/60' : 'text-muted-foreground')}>
              I have read, understood, and agree to abide by all NUverse Laguna Terms, Conditions, and Rules. I understand that violations may result in account suspension or ban.
            </span>
          </label>
        </div>

        <div className={cn(
          'flex gap-3 border-t px-6 pb-6 pt-4',
          isDark ? 'border-white/6' : 'border-border',
        )}>
          <button
            onClick={close}
            disabled={!read || !scrolled}
            className={cn(
              'w-full rounded-2xl py-3.5 text-sm font-black text-white transition-all',
              read && scrolled
                ? 'hover:-translate-y-0.5 hover:shadow-lg'
                : 'cursor-not-allowed opacity-50',
            )}
            style={read && scrolled ? {
              background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 55%, #6d55e8 100%)',
              boxShadow: '0 4px 24px rgba(74,110,232,0.38)',
            } : {
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
            }}
          >
            {!scrolled ? 'Read All Terms First' : !read ? 'Check the Box to Agree' : 'I Agree — Enter NUverse'}
          </button>
        </div>
      </div>
    </div>
  )
}
