import { useParams, Link } from 'react-router-dom'
import { useMyReservations } from '../hooks/useBulldogExchange'
import { paths } from '@/shared/routes/paths'
import { cn } from '@/shared/lib/cn'
import { useThemeStore } from '@/shared/store/themeStore'
import { useAuthStore } from '@/shared/store/authStore'

const RESERVATION_FEE = 50

function formatPrice(p: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(p)
}

/** Generates a short unique verification code from reservation ID + timestamp. */
function generateVerificationCode(reservationId: string, createdAt: string): string {
  const idPart = reservationId.replace(/-/g, '').slice(0, 6).toUpperCase()
  const datePart = new Date(createdAt).getTime().toString(36).slice(-4).toUpperCase()
  return `NUE-${idPart}-${datePart}`
}

export function ReservationInvoicePage() {
  const { reservationId = '' } = useParams()
  const isDark = useThemeStore((s) => s.theme === 'dark')
  const user   = useAuthStore((s) => s.user)

  const { data, isLoading } = useMyReservations(0)
  const reservation = data?.content.find((r) => r.id === reservationId)

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">Loading…</div>
  }
  if (!reservation) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-muted-foreground">Reservation not found.</p>
        <Link to={paths.myReservations} className="text-sm font-semibold text-primary hover:underline">
          Back to reservations
        </Link>
      </div>
    )
  }

  const issued   = new Date(reservation.createdAt).toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' })
  const expires  = new Date(reservation.expiresAt).toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' })
  const isPending = reservation.status === 'PENDING'
  const verificationCode = generateVerificationCode(reservation.id, reservation.createdAt)
  const total = reservation.price + RESERVATION_FEE

  return (
    <>
      {/* Global print styles — hide everything except the invoice card */}
      <style>{`
        @media print {
          html, body { visibility: hidden; }
          #invoice-printable { visibility: visible !important; position: absolute !important; inset: 0 !important; width: 100% !important; max-width: 100% !important; background: white !important; color: #1a1d24 !important; padding: 2cm !important; border: none !important; border-radius: 0 !important; box-shadow: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          #invoice-printable * { visibility: visible !important; }
          .print-hide { display: none !important; }
        }
      `}</style>

      {/* ── Screen controls — hidden when printing ─────────────────── */}
      <div className="mx-auto max-w-xl animate-[page-enter_0.3s_ease-out]">
        <div className="print-hide mb-4 flex items-center gap-3">
          <Link to={paths.myReservations} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to reservations
          </Link>
          <button
            onClick={() => window.print()}
            className={cn(
              'ml-auto flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5',
              isDark ? 'border-white/10 text-foreground hover:bg-white/5' : 'border-border text-foreground hover:bg-surface-muted hover:shadow-sm',
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print / Save as PDF
          </button>
        </div>

        {/* ── Invoice card ─────────────────────────────────────── */}
        <div
          id="invoice-printable"
          className={cn(
            'rounded-2xl border p-8 shadow-md',
            isDark ? 'border-white/10 bg-[#1c2130]' : 'border-border bg-white',
          )}
        >
          {/* Header — Logo + Title */}
          <div className="flex items-start justify-between gap-4">
            {/* Logo mark */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #1f3a8a, #4a6ee8)' }}
              >
                <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                  {/* Simplified bulldog face */}
                  <circle cx="20" cy="18" r="14" fill="#f5c58a"/>
                  <circle cx="14" cy="15" r="3" fill="#1a1d24"/>
                  <circle cx="26" cy="15" r="3" fill="#1a1d24"/>
                  <circle cx="15" cy="13" r="1" fill="white"/>
                  <circle cx="27" cy="13" r="1" fill="white"/>
                  <ellipse cx="20" cy="23" rx="7" ry="5" fill="#fcd9a8"/>
                  <ellipse cx="20" cy="21" rx="3" ry="2" fill="#2a1a0a"/>
                  <rect x="12" y="28" width="16" height="4" rx="2" fill="#1f3a8a"/>
                  <circle cx="20" cy="30" r="1.5" fill="#fcd34d"/>
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 dark:text-amber-400">
                  Official Invoice
                </p>
                <h1 className={cn('text-xl font-black', isDark ? 'text-white' : 'text-foreground')}>
                  Bulldog Exchange
                </h1>
                <p className="text-xs text-muted-foreground">NU Laguna Merchandise Store</p>
              </div>
            </div>

            {/* Status badge */}
            <div className={cn(
              'rounded-xl border px-3 py-1.5 text-xs font-bold',
              isPending
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-600 dark:text-emerald-400'
                : 'border-border text-muted-foreground',
            )}>
              {reservation.status}
            </div>
          </div>

          <hr className={cn('my-5', isDark ? 'border-white/10' : 'border-border')} />

          {/* Customer + Invoice info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</p>
              <p className={cn('mt-1 font-semibold', isDark ? 'text-white' : 'text-foreground')}>{user?.fullName ?? '—'}</p>
              <p className="text-xs text-muted-foreground">{user?.email ?? '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Invoice No.</p>
              <p className={cn('mt-1 font-mono text-sm font-bold', isDark ? 'text-white' : 'text-foreground')}>
                {reservation.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-[10px] text-muted-foreground">Issued {issued}</p>
            </div>
          </div>

          <hr className={cn('my-5', isDark ? 'border-white/10' : 'border-border')} />

          {/* Reserved item */}
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reserved Item</p>
            <div className={cn('rounded-xl border p-4', isDark ? 'border-white/8' : 'border-border')}>
              <p className={cn('font-bold', isDark ? 'text-white' : 'text-foreground')}>
                {reservation.productName.replace(/^\[(SHS|College|COLLEGE)\]\s*/i, '')}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {reservation.size  && <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Size: {reservation.size}</span>}
                {reservation.color && <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Color: {reservation.color}</span>}
                <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">SKU: {reservation.sku}</span>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Unit price</span>
                  <span className="font-mono font-semibold text-foreground">{formatPrice(reservation.price)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reservation fee</span>
                  <span className="font-mono font-semibold text-foreground">+ ₱{RESERVATION_FEE}.00</span>
                </div>
                <div className={cn(
                  'flex items-center justify-between border-t pt-2 text-sm font-black',
                  isDark ? 'border-white/10' : 'border-border',
                )}>
                  <span className={isDark ? 'text-white' : 'text-foreground'}>Total payable at counter</span>
                  <span className="font-mono text-base" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <hr className={cn('my-5', isDark ? 'border-white/10' : 'border-border')} />

          {/* Pickup instructions */}
          <div className={cn('rounded-xl p-4', isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200')}>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Pickup Instructions</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Present this invoice at the <strong>Bulldog Exchange counter</strong> at NU Laguna. Expires{' '}
              <strong className="text-amber-700 dark:text-amber-400">{expires}</strong>{' '}
              (Sundays excluded from deadline).
            </p>
          </div>

          {/* Verification code */}
          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verification Code</p>
              <p className={cn('mt-1 font-mono text-xl font-black tracking-[0.15em]', isDark ? 'text-white' : 'text-foreground')}>
                {verificationCode}
              </p>
              <p className="text-[10px] text-muted-foreground">Anti-forgery token — unique per reservation</p>
            </div>

            {/* Chibi mascot — looking straight for trademark purposes */}
            <svg width="70" height="80" viewBox="0 0 120 140" fill="none" aria-hidden="true">
              <circle cx="60" cy="55" r="38" fill="#f5c58a"/>
              <ellipse cx="60" cy="90" rx="34" ry="26" fill="#f0b870"/>
              {/* Eyes — looking straight */}
              <circle cx="46" cy="50" r="8" fill="#1a1d24"/>
              <circle cx="74" cy="50" r="8" fill="#1a1d24"/>
              <circle cx="49" cy="47" r="3" fill="white"/>
              <circle cx="77" cy="47" r="3" fill="white"/>
              {/* Nose + Snout */}
              <ellipse cx="60" cy="64" rx="13" ry="9" fill="#fcd9a8"/>
              <ellipse cx="60" cy="61" rx="5" ry="4" fill="#2a1a0a"/>
              {/* Ears */}
              <ellipse cx="28" cy="38" rx="10" ry="14" fill="#f5c58a" transform="rotate(-15 28 38)"/>
              <ellipse cx="92" cy="38" rx="10" ry="14" fill="#f5c58a" transform="rotate(15 92 38)"/>
              {/* NU collar */}
              <rect x="38" y="78" width="44" height="8" rx="4" fill="#1f3a8a"/>
              <circle cx="60" cy="82" r="3" fill="#fcd34d"/>
              {/* Tail — straight down, not swinging */}
              <path d="M94 100 Q108 110 104 125" stroke="#f5c58a" strokeWidth="6" strokeLinecap="round" fill="none"/>
              {/* Arms — pointing down/neutral */}
              <ellipse cx="26" cy="102" rx="9" ry="14" fill="#f0b870" transform="rotate(10 26 102)"/>
              <ellipse cx="94" cy="102" rx="9" ry="14" fill="#f0b870" transform="rotate(-10 94 102)"/>
            </svg>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-[10px] text-muted-foreground">
            NUverse Laguna · Km 53, Pan Philippine Hwy, Calamba City, Laguna 4027
          </p>
          <p className="text-center text-[10px] text-muted-foreground">
            This is an official reservation document. Do not alter. © 2026 NUverse Laguna
          </p>
        </div>
      </div>
    </>
  )
}
