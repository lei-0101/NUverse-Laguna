import { useEffect, useRef } from 'react'
import { create } from 'zustand'

// ── Global store ────────────────────────────────────────────────────────────
interface LoadingStore {
  showing: boolean
  show: () => void
  hide: () => void
}

export const useLoginLoadingStore = create<LoadingStore>((set) => ({
  showing: false,
  show: () => set({ showing: true }),
  hide: () => set({ showing: false }),
}))

// ── Messages ─────────────────────────────────────────────────────────────────
const MESSAGES = [
  'Loading your universe…',
  'Welcome back, Bulldog!',
  'Fetching campus updates…',
  'Almost there…',
  'Waking up the campus…',
]

interface Props { onDone: () => void }

export function LoginLoadingScreen({ onDone }: Props) {
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  const message = useRef(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]).current

  useEffect(() => {
    // Show for 3s then call done
    const t = setTimeout(() => onDoneRef.current(), 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0d14 0%, #0d1226 45%, #0e0e1a 100%)',
      }}
    >
      {/* Stars */}
      <div className="stars-wrap pointer-events-none" aria-hidden="true">
        <div className="stars-1" /><div className="stars-2" /><div className="stars-3" />
      </div>

      {/* Glow orb */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(74,110,232,0.25) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'float-orb 4s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Chibi */}
      <div style={{ position: 'relative', zIndex: 1, animation: 'chibi-bob 2.4s ease-in-out infinite' }}>
        <svg width="180" height="200" viewBox="0 0 120 140" fill="none" aria-label="Bulldog mascot">
          <ellipse cx="60" cy="108" rx="32" ry="24" fill="#f0b870" />
          <circle cx="60" cy="58" r="38" fill="#f5c58a" />
          <ellipse cx="26" cy="40" rx="12" ry="16" fill="#f0b870" transform="rotate(-15 26 40)" />
          <ellipse cx="94" cy="40" rx="12" ry="16" fill="#f0b870" transform="rotate(15 94 40)" />
          {/* Happy squint eyes */}
          <path d="M38 52 Q46 46 54 52" stroke="#1a1d24" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M66 52 Q74 46 82 52" stroke="#1a1d24" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          {/* Blush */}
          <ellipse cx="34" cy="63" rx="7" ry="4" fill="#f9a8a8" opacity="0.55" />
          <ellipse cx="86" cy="63" rx="7" ry="4" fill="#f9a8a8" opacity="0.55" />
          {/* Snout */}
          <ellipse cx="60" cy="70" rx="14" ry="10" fill="#fcd9a8" />
          <ellipse cx="60" cy="66" rx="5" ry="3.5" fill="#2a1a0a" />
          {/* Big smile + tongue */}
          <path d="M50 74 Q60 84 70 74" stroke="#2a1a0a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <ellipse cx="60" cy="79" rx="5" ry="4" fill="#f87171" />
          {/* Collar */}
          <rect x="38" y="90" width="44" height="9" rx="4.5" fill="#1f3a8a" />
          <circle cx="60" cy="94.5" r="3.5" fill="#fcd34d" />
          {/* Arms */}
          <ellipse cx="28" cy="108" rx="10" ry="16" fill="#f0b870" transform="rotate(25 28 108)"
            style={{ transformOrigin: '28px 96px', animation: 'chibi-wave-auto 2.8s ease-in-out infinite' }} />
          <ellipse cx="92" cy="108" rx="10" ry="16" fill="#f0b870" transform="rotate(-15 92 108)" />
          {/* Legs */}
          <ellipse cx="48" cy="128" rx="9" ry="12" fill="#f0b870" />
          <ellipse cx="72" cy="128" rx="9" ry="12" fill="#f0b870" />
        </svg>

        {/* Speech bubble */}
        <div
          style={{
            position: 'absolute',
            top: -32,
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            borderRadius: 999,
            padding: '6px 16px',
            fontSize: 12,
            fontWeight: 900,
            color: 'white',
            background: 'linear-gradient(135deg, #1f3a8a, #4a6ee8)',
            boxShadow: '0 4px 16px rgba(74,110,232,0.45)',
            animation: 'bubble-in 0.35s ease-out both',
          }}
        >
          Welcome back, Bulldog! 🐾
        </div>
      </div>

      {/* Label + message */}
      <div style={{ position: 'relative', zIndex: 1, marginTop: 28, textAlign: 'center' }}>
        <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.38em', textTransform: 'uppercase', color: 'rgba(245,179,0,0.9)' }}>
          NUverse Laguna
        </p>
        <p style={{ marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
          {message}
        </p>
      </div>

      {/* Dots */}
      <div style={{ position: 'relative', zIndex: 1, marginTop: 20, display: 'flex', gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4a6ee8, #a78bfa)',
              animation: 'dot-pulse 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.28}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
