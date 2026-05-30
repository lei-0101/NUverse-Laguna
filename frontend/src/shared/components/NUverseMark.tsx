import { cn } from '@/shared/lib/cn'

interface NUverseMarkProps {
  className?: string
  size?: number
  showWordmark?: boolean
}

/**
 * NUverse Laguna brand mark.
 * 3D-shaded NU blue sphere · prominent bulldog face · Y2K chrome orbital ring · sparkles.
 * Gradient IDs prefixed "nm-" to avoid SVG conflicts.
 */
export function NUverseMark({ className, size = 40, showWordmark = true }: NUverseMarkProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <defs>
          {/* 3D sphere gradient — lit from upper-left */}
          <radialGradient id="nm-sphere" cx="35%" cy="28%" r="65%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#a8c4ff" />
            <stop offset="18%"  stopColor="#4a6ee8" />
            <stop offset="52%"  stopColor="#1f3a8a" />
            <stop offset="100%" stopColor="#0a1442" />
          </radialGradient>

          {/* Bulldog face gradient — warm gold */}
          <radialGradient id="nm-dog-face" cx="40%" cy="30%" r="65%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#fde68a" />
            <stop offset="55%"  stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>

          {/* Snout gradient */}
          <radialGradient id="nm-snout" cx="50%" cy="35%" r="60%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fbbf24" />
          </radialGradient>

          {/* Chrome ring — Y2K iridescent */}
          <linearGradient id="nm-ring" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="15%"  stopColor="#f5b300" stopOpacity="1"   />
            <stop offset="35%"  stopColor="#a78bfa" stopOpacity="1"   />
            <stop offset="55%"  stopColor="#4a6ee8" stopOpacity="1"   />
            <stop offset="75%"  stopColor="#f5b300" stopOpacity="1"   />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
          </linearGradient>

          {/* Sparkle gold */}
          <linearGradient id="nm-sparkle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#f5b300" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="nm-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Sphere shadow */}
          <filter id="nm-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,10,60,0.55)" />
          </filter>

          {/* Sparkle glow */}
          <filter id="nm-sparkle-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Clip for front ring arc */}
          <clipPath id="nm-front-ring-clip">
            <rect x="0" y="40" width="80" height="40" />
          </clipPath>
        </defs>

        {/* ── Outer glow halo ───────────────────────────── */}
        <circle
          cx="40" cy="40" r="32"
          fill="rgba(74,110,232,0.18)"
          filter="url(#nm-glow)"
        />

        {/* ── Back ring arc (behind sphere) ─────────────── */}
        <path
          d="M 4 40 A 36 12 0 0 0 76 40"
          stroke="url(#nm-ring)"
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* ── Main sphere ───────────────────────────────── */}
        <circle
          cx="40" cy="40" r="28"
          fill="url(#nm-sphere)"
          filter="url(#nm-shadow)"
        />

        {/* ── Bulldog face ──────────────────────────────── */}
        {/* Head base (gold oval, takes up most of sphere) */}
        <ellipse cx="40" cy="39" rx="19" ry="20" fill="url(#nm-dog-face)" />

        {/* Ears */}
        <ellipse cx="24.5" cy="25" rx="5.5" ry="6.5" fill="#d97706" />
        <ellipse cx="55.5" cy="25" rx="5.5" ry="6.5" fill="#d97706" />
        <ellipse cx="24.5" cy="25" rx="3"   ry="3.5" fill="#f59e0b" />
        <ellipse cx="55.5" cy="25" rx="3"   ry="3.5" fill="#f59e0b" />

        {/* Brow furrows — character-defining frown lines */}
        <path d="M 28 30 Q 35 26 40 28.5" stroke="#92400e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M 52 30 Q 45 26 40 28.5" stroke="#92400e" strokeWidth="1.6" fill="none" strokeLinecap="round" />

        {/* Eyes white */}
        <circle cx="33.5" cy="35" r="4.2" fill="white" />
        <circle cx="46.5" cy="35" r="4.2" fill="white" />
        {/* Pupils */}
        <circle cx="34"   cy="35.5" r="2.5" fill="#1a0a00" />
        <circle cx="47"   cy="35.5" r="2.5" fill="#1a0a00" />
        {/* Eye shine */}
        <circle cx="32.8" cy="34.2" r="0.9" fill="white" />
        <circle cx="45.8" cy="34.2" r="0.9" fill="white" />

        {/* Snout area */}
        <ellipse cx="40" cy="47.5" rx="12"  ry="8.5"  fill="url(#nm-snout)" />
        {/* Nose */}
        <ellipse cx="40" cy="43"   rx="5.5" ry="3.2"  fill="#1a0a00" />
        {/* Nostrils */}
        <ellipse cx="37.5" cy="43.5" rx="1.3" ry="0.9" fill="#3d1500" />
        <ellipse cx="42.5" cy="43.5" rx="1.3" ry="0.9" fill="#3d1500" />

        {/* Mouth / underbite */}
        <path d="M 32 51.5 Q 36 55 40 54.5 Q 44 55 48 51.5" stroke="#92400e" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {/* Lower teeth hint (underbite) */}
        <path d="M 35.5 53.5 Q 38 56.5 40 55.5 Q 42 56.5 44.5 53.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7" />

        {/* Jowl wrinkle lines */}
        <path d="M 27 47 Q 26 51 29 54" stroke="#92400e" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M 53 47 Q 54 51 51 54" stroke="#92400e" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />

        {/* NU jersey collar stripe */}
        <path d="M 28 58 Q 40 64 52 58" stroke="#1f3a8a" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M 28 58 Q 40 64 52 58" stroke="#4a6ee8" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />

        {/* ── Front ring arc (in front of sphere) ───────── */}
        <path
          d="M 4 40 A 36 12 0 0 1 76 40"
          stroke="url(#nm-ring)"
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
          clipPath="url(#nm-front-ring-clip)"
        />

        {/* ── Sphere specular highlight ─────────────────── */}
        <ellipse
          cx="33" cy="27" rx="8" ry="5"
          fill="rgba(255,255,255,0.28)"
          style={{ filter: 'blur(2.5px)' }}
        />
        <ellipse
          cx="31" cy="25" rx="3" ry="2"
          fill="rgba(255,255,255,0.45)"
          style={{ filter: 'blur(1px)' }}
        />

        {/* ── Y2K 4-pointed sparkles ────────────────────── */}
        {/* Top-right sparkle */}
        <g transform="translate(64, 10)" filter="url(#nm-sparkle-glow)"
           style={{ animation: 'sparkle-pop 2.4s ease-in-out infinite' }}>
          <path d="M0-5 L1.2-1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2-1.2 Z"
            fill="url(#nm-sparkle)" />
        </g>
        {/* Bottom-right sparkle */}
        <g transform="translate(70, 56)" filter="url(#nm-sparkle-glow)"
           style={{ animation: 'sparkle-pop 3.1s ease-in-out infinite 0.6s' }}>
          <path d="M0-3.5 L0.8-0.8 L3.5 0 L0.8 0.8 L0 3.5 L-0.8 0.8 L-3.5 0 L-0.8-0.8 Z"
            fill="url(#nm-sparkle)" opacity="0.85" />
        </g>
        {/* Top-left sparkle */}
        <g transform="translate(13, 8)" filter="url(#nm-sparkle-glow)"
           style={{ animation: 'sparkle-pop-2 2.8s ease-in-out infinite 0.3s' }}>
          <path d="M0-4 L0.9-0.9 L4 0 L0.9 0.9 L0 4 L-0.9 0.9 L-4 0 L-0.9-0.9 Z"
            fill="url(#nm-sparkle)" opacity="0.75" />
        </g>
        {/* Bottom-left sparkle */}
        <g transform="translate(8, 62)" filter="url(#nm-sparkle-glow)"
           style={{ animation: 'sparkle-pop-2 3.5s ease-in-out infinite 1s' }}>
          <path d="M0-3 L0.7-0.7 L3 0 L0.7 0.7 L0 3 L-0.7 0.7 L-3 0 L-0.7-0.7 Z"
            fill="url(#nm-sparkle)" opacity="0.6" />
        </g>
      </svg>

      {showWordmark && (
        <div className="flex flex-col leading-none select-none">
          <span
            className="font-extrabold tracking-tight"
            style={{
              fontSize: Math.max(size * 0.36, 13),
              background: 'linear-gradient(135deg, #4a6ee8 0%, #a78bfa 40%, #f5b300 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 1px 2px rgba(31,58,138,0.25))',
            }}
          >
            NUverse
          </span>
          <span
            className="font-bold tracking-[0.18em] uppercase"
            style={{
              fontSize: Math.max(size * 0.2, 8),
              background: 'linear-gradient(90deg, #94a3b8 0%, #cbd5e1 50%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Laguna
          </span>
        </div>
      )}
    </div>
  )
}
