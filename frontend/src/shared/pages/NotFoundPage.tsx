import { Link } from 'react-router-dom'
import { paths } from '@/shared/routes/paths'
import { NUverseMark } from '@/shared/components/NUverseMark'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-bg px-4 text-center">
      {/* Star field in dark mode */}
      <div className="stars-wrap" aria-hidden="true">
        <div className="stars-1" />
        <div className="stars-2" />
        <div className="stars-3" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 animate-[page-enter_0.4s_ease-out]">
        <NUverseMark size={56} />

        {/* Sad bulldog SVG */}
        <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
          <ellipse cx="60" cy="80" rx="28" ry="22" fill="#f0b870" />
          <circle cx="60" cy="52" r="26" fill="#f5c58a" />
          <ellipse cx="36" cy="36" rx="10" ry="13" fill="#e8a460" />
          <ellipse cx="84" cy="36" rx="10" ry="13" fill="#e8a460" />
          <ellipse cx="36" cy="37" rx="6" ry="8" fill="rgba(245,100,80,0.4)" />
          <ellipse cx="84" cy="37" rx="6" ry="8" fill="rgba(245,100,80,0.4)" />
          {/* Sad closed eyes */}
          <path d="M44 46 Q50 42 56 46" stroke="#1a1d24" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M64 46 Q70 42 76 46" stroke="#1a1d24" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Snout */}
          <ellipse cx="60" cy="62" rx="12" ry="8" fill="#fcd9a8" />
          <ellipse cx="60" cy="58" rx="5" ry="3.5" fill="#2a1a0a" />
          {/* Sad frown */}
          <path d="M52 69 Q60 64 68 69" stroke="#8b4513" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Teardrop */}
          <ellipse cx="46" cy="54" rx="2" ry="3" fill="#60a5fa" opacity="0.8" />
          {/* Collar */}
          <rect x="42" y="73" width="36" height="6" rx="3" fill="#1f3a8a" />
          <circle cx="60" cy="76" r="3" fill="#fcd34d" />
          {/* Front legs */}
          <rect x="40" y="92" width="10" height="20" rx="5" fill="#f0b870" />
          <rect x="70" y="92" width="10" height="20" rx="5" fill="#f0b870" />
        </svg>

        <div className="space-y-2">
          <p className="text-7xl font-bold tabular-nums text-foreground font-mono">404</p>
          <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Woof! Even the Bulldog couldn't sniff this one out. The page you're looking for doesn't exist.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to={paths.dashboard}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Back to Home
          </Link>
          <Link
            to={paths.marketplace}
            className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  )
}
