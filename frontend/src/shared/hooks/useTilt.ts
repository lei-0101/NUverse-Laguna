import { useRef, useState, useCallback } from 'react'

interface TiltState {
  x: number
  y: number
}

interface UseTiltOptions {
  maxDeg?: number
}

/**
 * Returns ref + style to apply a subtle 3D tilt to a card on mouse hover.
 * Usage: spread `tiltHandlers` onto the element and apply `tiltStyle` to it.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>({ maxDeg = 6 }: UseTiltOptions = {}) {
  const ref = useRef<T>(null)
  const [tilt, setTilt] = useState<TiltState>({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e: React.MouseEvent<T>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const rx = ((e.clientY - cy) / (rect.height / 2)) * maxDeg
    const ry = -((e.clientX - cx) / (rect.width / 2)) * maxDeg
    setTilt({ x: rx, y: ry })
  }, [maxDeg])

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
  }, [])

  const tiltStyle: React.CSSProperties = {
    transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
    transition: 'transform 0.25s ease',
    transformStyle: 'preserve-3d',
  }

  return {
    ref,
    tiltStyle,
    tiltHandlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    } as {
      onMouseMove: React.MouseEventHandler<T>
      onMouseLeave: React.MouseEventHandler<T>
    },
  }
}
