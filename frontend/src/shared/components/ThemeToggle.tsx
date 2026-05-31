import { useState } from 'react'
import { useThemeStore } from '@/shared/store/themeStore'

export function ThemeToggle() {
  const theme       = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const isDark      = theme === 'dark'
  const [bursting, setBursting] = useState(false)

  const handleClick = () => {
    setBursting(true)
    setTimeout(() => setBursting(false), 350)
    toggleTheme()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-90"
      style={bursting ? { animation: 'sun-burst 0.35s ease-out' } : undefined}
    >
      {isDark ? (
        /* Moon — always floating */
        <span className="theme-toggle-moon flex items-center justify-center transition-all duration-300">
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              fill="currentColor"
              className="text-slate-200"
            />
            <circle cx="17.5" cy="4"   r="0.7" fill="#f5b300" opacity="0.9"
              style={{ animation: 'sparkle-pop 2s ease-in-out infinite' }} />
            <circle cx="20"   cy="7"   r="0.5" fill="#a78bfa" opacity="0.8"
              style={{ animation: 'sparkle-pop-2 2.6s ease-in-out infinite 0.4s' }} />
            <circle cx="19"   cy="2.5" r="0.4" fill="white"   opacity="0.75"
              style={{ animation: 'sparkle-pop 3.2s ease-in-out infinite 0.8s' }} />
          </svg>
        </span>
      ) : (
        /* Sun — rays always slowly rotating */
        <span className="flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-amber-500" fill="none">
            <circle cx="12" cy="12" r="4.5" fill="currentColor" />
            <g
              style={{
                transformOrigin: '12px 12px',
                animation: 'sun-spin-continuous 10s linear infinite',
              }}
            >
              <line x1="12" y1="2"    x2="12" y2="4.5"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="12" y1="19.5" x2="12" y2="22"   stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="2"  y1="12"   x2="4.5" y2="12"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="19.5" y1="12" x2="22"  y2="12"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="4.93"  y1="4.93"  x2="6.64"  y2="6.64"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="17.36" y1="17.36" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="4.93"  y1="19.07" x2="6.64"  y2="17.36" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="17.36" y1="6.64"  x2="19.07" y2="4.93"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          </svg>
        </span>
      )}
    </button>
  )
}
