import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const COLORS = [
  '#1f3a8a', '#3b5bd9', '#4a6ee8',  // NU blues
  '#f5b300', '#fcd34d', '#e09800',  // gold
  '#10b981', '#34d399',             // green
  '#f43f5e', '#fb7185',             // rose
  '#a855f7', '#c084fc',             // purple
  '#06b6d4', '#67e8f9',             // cyan
]

const SHAPES = ['rect', 'circle', 'ribbon'] as const
type Shape = typeof SHAPES[number]

interface Piece {
  id: number
  x: number         // vw %
  delay: number     // s
  duration: number  // s
  color: string
  size: number      // px
  spin: number      // deg per 100ms (rotation speed direction)
  shape: Shape
  drift: number     // px, horizontal drift amplitude
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: rand(2, 98),
    delay: rand(0, 0.8),
    duration: rand(2.0, 3.2),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: rand(7, 13),
    spin: rand(200, 600) * (Math.random() > 0.5 ? 1 : -1),
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    drift: rand(-60, 60),
  }))
}

interface Props {
  count?: number
  onDone?: () => void
}

export function Confetti({ count = 60, onDone }: Props) {
  const pieces = useRef(makePieces(count)).current
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const maxDuration = Math.max(...pieces.map((p) => (p.delay + p.duration) * 1000))
    const tid = setTimeout(() => onDone?.(), maxDuration + 200)
    return () => clearTimeout(tid)
  }, [pieces, onDone])

  const content = (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {pieces.map((p) => {
        const keyframes = `
          @keyframes confetti-fall-${p.id} {
            0%   { transform: translateY(-12px) translateX(0) rotate(0deg); opacity: 1; }
            80%  { opacity: 1; }
            100% { transform: translateY(105vh) translateX(${p.drift}px) rotate(${p.spin}deg); opacity: 0; }
          }
        `
        return (
          <span key={p.id}>
            <style>{keyframes}</style>
            <span
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: 0,
                width: p.shape === 'ribbon' ? p.size * 0.4 : p.size,
                height: p.shape === 'ribbon' ? p.size * 2.5 : p.size,
                borderRadius:
                  p.shape === 'circle' ? '50%' : p.shape === 'ribbon' ? '2px' : '2px',
                background: p.color,
                animationName: `confetti-fall-${p.id}`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                animationFillMode: 'both',
              }}
            />
          </span>
        )
      })}
    </div>
  )

  return createPortal(content, document.body)
}
