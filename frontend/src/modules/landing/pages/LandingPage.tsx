import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { NUverseMark } from '@/shared/components/NUverseMark'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { useThemeStore } from '@/shared/store/themeStore'
import { paths } from '@/shared/routes/paths'

// ── Particles — right side emphasis so campus photo shows clearly ──────
const PARTICLES = [
  { left: '52%', bottom: '22%', size: 3, delay: '0s',   dur: '13s', c: 0 },
  { left: '63%', bottom: '15%', size: 2, delay: '3s',   dur: '11s', c: 1 },
  { left: '72%', bottom: '9%',  size: 4, delay: '6.5s', dur: '15s', c: 2 },
  { left: '83%', bottom: '30%', size: 2, delay: '1.5s', dur: '12s', c: 0 },
  { left: '91%', bottom: '18%', size: 3, delay: '8s',   dur: '14s', c: 1 },
  { left: '58%', bottom: '42%', size: 2, delay: '4.5s', dur: '16s', c: 2 },
  { left: '78%', bottom: '52%', size: 3, delay: '2s',   dur: '10s', c: 0 },
  { left: '67%', bottom: '60%', size: 2, delay: '9s',   dur: '13s', c: 1 },
  { left: '88%', bottom: '65%', size: 3, delay: '5s',   dur: '17s', c: 2 },
  { left: '94%', bottom: '45%', size: 2, delay: '7s',   dur: '12s', c: 0 },
]
const PCOLORS = [
  'rgba(245,179,0,0.85)',
  'rgba(120,160,255,0.75)',
  'rgba(255,255,255,0.65)',
]

// ── Chibi speech ────────────────────────────────────────────────────────
const CHIBI_MSGS = [
  'Hi, Bulldog! 👋',
  'Welcome to NUverse!',
  'Check the Marketplace 🛒',
  'RSVP to events! 🎉',
  'Earn XP daily 🐾',
  'Lost something? We help 🔍',
]

// ── Modules ─────────────────────────────────────────────────────────────
const MODULES = [
  { num: '01', name: 'Marketplace',      desc: 'The campus flea market — buy and sell pre-loved items, textbooks, gadgets, and commissions with verified NU Laguna students.',     accent: '#10b981' },
  { num: '02', name: 'Campus Events',    desc: 'Your front-row seat to NU Laguna life — discover upcoming events, RSVP in one tap, and never miss out on what matters.',        accent: '#8b5cf6' },
  { num: '03', name: 'Bulldog Exchange', desc: 'The official NU Laguna merchandise hub — reserve authentic jerseys, uniforms, bags, and collectibles directly on campus.',    accent: '#f59e0b' },
  { num: '04', name: 'Lost & Found',     desc: 'Reunite Bulldogs with their belongings — report lost items, browse found ones, and let the community help.',     accent: '#ef4444' },
  { num: '05', name: 'Bulldog Chibi',    desc: 'Your digital campus identity — earn XP, level up through tiers, unlock achievements, and build your Bulldog legacy.',        accent: '#a855f7' },
  { num: '06', name: 'Announcements',    desc: 'Stay in the loop — official news, urgent alerts, and important updates direct from NU Laguna faculty and administration.',           accent: '#3b82f6' },
]

// ── Social ──────────────────────────────────────────────────────────────
const SOCIALS = [
  { href: 'https://www.facebook.com/NULagunaPH/',  label: 'FB', d: 'M22 12a10 10 0 1 0-11.56 9.87v-6.99H8v-2.88h2.44V9.8c0-2.41 1.44-3.74 3.63-3.74 1.05 0 2.15.19 2.15.19v2.36h-1.21c-1.19 0-1.56.74-1.56 1.5v1.79H16.3l-.42 2.88h-2.27v6.99A10 10 0 0 0 22 12z' },
  { href: 'https://www.instagram.com/nulagunaph/', label: 'IG', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' },
  { href: 'https://x.com/NULagunaPH',              label: 'X',  d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
]

// ── Chibi Bulldog (tail removed, CSS-class animations) ──────────────────
function ChibiBulldog({ isDark }: { isDark: boolean }) {
  const [msgIdx, setMsgIdx] = useState(0)
  const [bubbleOn, setBubbleOn] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setBubbleOn(true), 1800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!bubbleOn) return
    const id = setInterval(() => {
      setBubbleOn(false)
      const swap = setTimeout(() => {
        setMsgIdx((i) => (i + 1) % CHIBI_MSGS.length)
        setBubbleOn(true)
      }, 380)
      return () => clearTimeout(swap)
    }, 4000)
    return () => clearInterval(id)
  }, [bubbleOn])

  return (
    <div className="absolute bottom-6 right-8 z-20 flex flex-col items-center select-none">
      {/* Bubble */}
      <div
        className="relative mb-3 max-w-[138px] rounded-2xl px-3.5 py-2.5 text-center text-[12px] font-semibold leading-snug shadow-2xl"
        style={{
          background: isDark ? 'rgba(12,20,50,0.95)' : 'rgba(255,255,255,0.97)',
          color:      isDark ? '#e2e8f0' : '#1e293b',
          border:     isDark ? '1px solid rgba(74,110,232,0.3)' : '1px solid rgba(31,58,138,0.1)',
          backdropFilter: 'blur(20px)',
          opacity:   bubbleOn ? 1 : 0,
          transform: bubbleOn ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(4px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          pointerEvents: 'none',
        }}
      >
        {CHIBI_MSGS[msgIdx]}
        <span
          className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 h-0 w-0 block"
          style={{
            borderLeft:  '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop:   `6px solid ${isDark ? 'rgba(12,20,50,0.95)' : 'rgba(255,255,255,0.97)'}`,
          }}
        />
      </div>

      {/* Chibi SVG — no tail */}
      <div className="chibi-root cursor-pointer" title="Your Bulldog companion!">
        <svg
          width="100" height="112" viewBox="0 0 100 112" fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.5))' }}
        >
          {/* Ground shadow */}
          <ellipse cx="50" cy="109" rx="26" ry="4" fill="rgba(0,0,0,0.2)" />

          {/* Body — NU jersey */}
          <ellipse cx="50" cy="86" rx="26" ry="22" fill="#1f3a8a" />
          {/* Gold stripe */}
          <rect x="36" y="74" width="28" height="4" rx="2" fill="#f5b300" />
          {/* NU letters */}
          <text x="50" y="96" textAnchor="middle" fill="#f5b300"
            fontSize="10" fontWeight="900" fontFamily="'Plus Jakarta Sans', sans-serif">
            NU
          </text>

          {/* Left arm */}
          <ellipse cx="20" cy="84" rx="7" ry="12" fill="#f4b572" transform="rotate(-14 20 84)" />

          {/* Right arm — waving, CSS animated */}
          <g className="chibi-arm" style={{ transformOrigin: '76px 76px' }}>
            <ellipse cx="78" cy="80" rx="7" ry="12" fill="#f4b572" transform="rotate(20 78 80)" />
            <circle cx="82" cy="68" r="6"   fill="#f4b572" />
            <circle cx="79" cy="64" r="2.5" fill="#e8955a" />
            <circle cx="85" cy="65" r="2"   fill="#e8955a" />
            <circle cx="82" cy="62" r="1.8" fill="#e8955a" />
          </g>

          {/* Neck */}
          <rect x="40" y="63" width="20" height="10" rx="5" fill="#f4b572" />

          {/* Head */}
          <circle cx="50" cy="46" r="30" fill="#f4b572" />

          {/* Ears */}
          <ellipse cx="24" cy="28" rx="10" ry="12" fill="#e8955a" />
          <ellipse cx="76" cy="28" rx="10" ry="12" fill="#e8955a" />
          <ellipse cx="24" cy="28" rx="5.5" ry="7"  fill="#f4c18e" />
          <ellipse cx="76" cy="28" rx="5.5" ry="7"  fill="#f4c18e" />

          {/* Brow furrows */}
          <path d="M 30 35 Q 38 29 44 33" stroke="#c07a35" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M 70 35 Q 62 29 56 33" stroke="#c07a35" strokeWidth="2.2" fill="none" strokeLinecap="round" />

          {/* Eye whites */}
          <circle cx="37" cy="44" r="8" fill="white" />
          <circle cx="63" cy="44" r="8" fill="white" />
          {/* Pupils */}
          <circle className="chibi-eye"   cx="38" cy="45" r="5" fill="#1a0800" style={{ transformOrigin: '38px 45px' }} />
          <circle className="chibi-eye-r" cx="64" cy="45" r="5" fill="#1a0800" style={{ transformOrigin: '64px 45px' }} />
          {/* Shines */}
          <circle cx="36" cy="43"   r="1.6" fill="white" />
          <circle cx="62" cy="43"   r="1.6" fill="white" />

          {/* Snout */}
          <ellipse cx="50" cy="57" rx="14" ry="10" fill="#fde5a8" />
          {/* Nose */}
          <ellipse cx="50" cy="52" rx="7.5" ry="4.5" fill="#2d1500" />
          <ellipse cx="47" cy="52.5" rx="1.6" ry="1"  fill="#5a2e00" />
          <ellipse cx="53" cy="52.5" rx="1.6" ry="1"  fill="#5a2e00" />
          {/* Smile */}
          <path d="M 38 60 Q 50 68 62 60" stroke="#c07a35" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Underbite teeth */}
          <path d="M 43 63.5 Q 50 68 57 63.5" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Jowl wrinkles */}
          <path d="M 28 55 Q 27 61 30 64" stroke="#c07a35" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.45" />
          <path d="M 72 55 Q 73 61 70 64" stroke="#c07a35" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.45" />
        </svg>
      </div>
    </div>
  )
}

// ── Main ────────────────────────────────────────────────────────────────
export function LandingPage() {
  const isDark  = useThemeStore((s) => s.theme === 'dark')
  const imgRef  = useRef<HTMLImageElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const [parallax, setParallax]     = useState({ x: 0, y: 0 })
  const [navScrolled, setNavScrolled] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY, currentTarget } = e
    const { width, height } = currentTarget.getBoundingClientRect()
    setParallax({
      x: ((clientX / width)  - 0.5) * -22,
      y: ((clientY / height) - 0.5) * -12,
    })
  }

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 48)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div
      className="min-h-svh overflow-x-hidden"
      style={{ background: isDark ? '#060810' : '#eef2ff' }}
    >
      {/* Star field */}
      <div className="stars-wrap" aria-hidden="true">
        <div className="stars-1" /><div className="stars-2" /><div className="stars-3" />
      </div>

      {/* ── Nav ────────────────────────────────────────────── */}
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: navScrolled
            ? (isDark ? 'rgba(6,8,16,0.94)' : 'rgba(255,255,255,0.94)')
            : 'transparent',
          backdropFilter: navScrolled ? 'blur(24px)' : 'none',
          WebkitBackdropFilter: navScrolled ? 'blur(24px)' : 'none',
          borderBottom: navScrolled
            ? `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`
            : '1px solid transparent',
        }}
      >
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6 sm:px-10">
          <Link to={paths.landing} className="flex items-center gap-2">
            <NUverseMark size={36} showWordmark={false} />
            <span
              className="hidden text-base font-black sm:block transition-colors duration-300"
              style={{
                letterSpacing: '-0.02em',
                color: navScrolled && !isDark ? '#1f3a8a' : '#ffffff',
              }}
            >
              NUverse <span style={{ color: '#f5b300' }}>Laguna</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to={paths.login}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
              style={{
                color: navScrolled && !isDark ? '#1f3a8a' : '#ffffff',
                textShadow: navScrolled && !isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.6)',
              }}
            >
              Sign In
            </Link>
            <Link
              to={paths.register}
              className="rounded-xl px-5 py-2 text-sm font-bold text-white transition-all hover:-translate-y-0.5 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 100%)',
                boxShadow: '0 2px 16px rgba(74,110,232,0.5)',
              }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero — full bleed, LEFT-ALIGNED layout ───────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[100svh] items-center overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setParallax({ x: 0, y: 0 })}
      >
        {/* Campus photo — parallax, full bleed */}
        <div className="absolute inset-0">
          <img
            ref={imgRef}
            src="/images/campus.jpg"
            alt="National University Laguna campus"
            className="absolute h-[115%] w-[115%] object-cover object-center"
            style={{
              top: '-7.5%', left: '-7.5%',
              transform: `translate(${parallax.x}px, ${parallax.y}px)`,
              transition: 'transform 0.15s ease-out',
              animation: 'campus-breathe 30s ease-in-out infinite',
            }}
          />

          {/* Directional overlay: very dark LEFT (text area), transparent RIGHT (campus shows) */}
          <div
            className="absolute inset-0"
            style={{
              background: isDark
                ? 'linear-gradient(to right, rgba(4,6,16,0.97) 0%, rgba(4,6,16,0.90) 32%, rgba(4,6,16,0.60) 58%, rgba(4,6,16,0.20) 80%, rgba(4,6,16,0.05) 100%)'
                : 'linear-gradient(to right, rgba(10,24,90,0.95) 0%, rgba(10,24,90,0.85) 32%, rgba(10,24,90,0.52) 58%, rgba(10,24,90,0.18) 80%, rgba(10,24,90,0.04) 100%)',
            }}
          />
          {/* Bottom fade */}
          <div
            className="absolute bottom-0 inset-x-0 h-52"
            style={{ background: isDark ? 'linear-gradient(to top, rgba(6,8,16,1), transparent)' : 'linear-gradient(to top, rgba(8,18,70,0.85), transparent)' }}
          />
          {/* Top vignette — ensures nav links always readable against the photo */}
          <div
            className="absolute top-0 inset-x-0 h-28 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.60), transparent)' }}
          />
          {/* Slight vignette */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, transparent 20%, rgba(0,0,0,0.25) 100%)' }} />
        </div>

        {/* ── Dark mode atmospheric orbs — above the overlay, below text ── */}
        {isDark && (
          <div className="pointer-events-none absolute inset-0 z-[2]" aria-hidden="true">
            {/* Large NU blue glow — left/content side */}
            <div className="absolute rounded-full" style={{
              width: 700, height: 700, top: '-15%', left: '-20%',
              background: 'radial-gradient(circle, rgba(74,110,232,0.22) 0%, transparent 65%)',
              filter: 'blur(8px)',
              animation: 'float-orb 16s ease-in-out infinite',
            }} />
            {/* Gold glow — lower left */}
            <div className="absolute rounded-full" style={{
              width: 500, height: 500, bottom: '0%', left: '10%',
              background: 'radial-gradient(circle, rgba(245,179,0,0.16) 0%, transparent 65%)',
              filter: 'blur(8px)',
              animation: 'float-orb 20s ease-in-out infinite 3s',
            }} />
            {/* Purple accent — upper center */}
            <div className="absolute rounded-full" style={{
              width: 420, height: 420, top: '5%', left: '28%',
              background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 65%)',
              filter: 'blur(6px)',
              animation: 'float-orb 13s ease-in-out infinite 6s',
            }} />
            {/* Teal accent — mid center */}
            <div className="absolute rounded-full" style={{
              width: 320, height: 320, top: '45%', left: '22%',
              background: 'radial-gradient(circle, rgba(20,184,166,0.11) 0%, transparent 65%)',
              filter: 'blur(6px)',
              animation: 'float-orb 18s ease-in-out infinite 9s',
            }} />
          </div>
        )}

        {/* Particles — right side, where campus photo is visible */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {PARTICLES.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: p.left, bottom: p.bottom,
                width: p.size, height: p.size,
                background: PCOLORS[p.c],
                boxShadow: `0 0 ${p.size * 4}px ${PCOLORS[p.c]}`,
                animation: `particle-rise ${p.dur} ease-in-out infinite ${p.delay}`,
              }}
            />
          ))}
        </div>

        {/* ── Left-aligned hero content ──────────────────── */}
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 sm:px-10">
          <div className="max-w-[640px]">

            {/* Eyebrow: institution + live badge */}
            <div
              className="mb-8 flex flex-wrap items-center gap-3"
              style={{ animation: 'hero-reveal 0.5s ease-out both' }}
            >
              <span
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/90"
                style={{
                  borderColor: 'rgba(255,255,255,0.20)',
                  background: 'rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                {/* NU Shield mark */}
                <svg width="13" height="15" viewBox="0 0 13 15" fill="none" aria-hidden="true">
                  <path d="M6.5 0L0 2.8v5.6C0 11.5 2.8 14.3 6.5 15 10.2 14.3 13 11.5 13 8.4V2.8L6.5 0z" fill="rgba(245,179,0,0.85)" />
                  <text x="6.5" y="10" textAnchor="middle" fill="#1f3a8a" fontSize="6.5" fontWeight="900">NU</text>
                </svg>
                National University Laguna
              </span>


            </div>

            {/* Main heading — MASSIVE, left-aligned */}
            <h1
              style={{
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 0.9,
                animation: 'hero-reveal 0.55s ease-out 0.1s both',
              }}
            >
              <span
                className="block"
                style={{
                  fontSize: 'clamp(4.5rem, 12vw, 9.5rem)',
                  color: '#ffffff',
                  textShadow: '0 4px 40px rgba(74,110,232,0.5)',
                }}
              >
                NUverse
              </span>
              <span
                className="block"
                style={{
                  fontSize: 'clamp(1.4rem, 3.5vw, 3rem)',
                  fontWeight: 700,
                  letterSpacing: '0.32em',
                  color: '#f5b300',
                  marginTop: '0.18em',
                  textShadow: '0 2px 20px rgba(245,179,0,0.45)',
                }}
              >
                LAGUNA
              </span>
            </h1>

            {/* Accent line */}
            <div
              className="my-8 h-[2px] w-24 rounded-full"
              style={{
                background: 'linear-gradient(90deg, rgba(74,110,232,0.9), rgba(245,179,0,0.7), transparent)',
                animation: 'hero-reveal 0.5s ease-out 0.2s both',
              }}
              aria-hidden="true"
            />

            {/* Tagline */}
            <p
              className="mb-10 max-w-md text-base leading-relaxed sm:text-[1.1rem]"
              style={{
                color: 'rgba(255,255,255,0.78)',
                animation: 'hero-reveal 0.55s ease-out 0.28s both',
              }}
            >
              Your campus. Your community. Your universe.
              Everything NU Laguna in one platform — built exclusively for Bulldogs.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-wrap gap-3"
              style={{ animation: 'hero-reveal 0.55s ease-out 0.36s both' }}
            >
              <Link
                to={paths.login}
                className="rounded-2xl px-8 py-3.5 text-[15px] font-bold text-white transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(74,110,232,0.55)] active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #1f3a8a 0%, #4a6ee8 55%, #7055ea 100%)',
                  boxShadow: '0 4px 24px rgba(74,110,232,0.48), 0 1px 0 rgba(255,255,255,0.08) inset',
                }}
              >
                Sign In to NUverse
              </Link>
              <Link
                to={paths.register}
                className="rounded-2xl border border-white/20 bg-white/[0.07] px-8 py-3.5 text-[15px] font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-1.5 hover:bg-white/12 active:scale-[0.97]"
              >
                Create Account →
              </Link>
            </div>

            {/* Domain notice */}
            <p
              className="mt-5 text-sm font-medium"
              style={{ color: 'rgba(255,255,255,0.7)', animation: 'hero-reveal 0.55s ease-out 0.44s both' }}
            >
              Requires{' '}
              <span style={{ color: '#ffffff', fontWeight: 700 }}>
                @students.nu-laguna.edu.ph
              </span>
              {' '}email address
            </p>
          </div>
        </div>

        {/* Chibi mascot — bottom right */}
        <ChibiBulldog isDark={isDark} />

        {/* Scroll cue */}
        <div
          className="absolute bottom-8 left-12 sm:left-16 flex items-center gap-2.5"
          style={{ animation: 'hero-reveal 0.55s ease-out 0.52s both', color: '#ffffff' }}
          aria-hidden="true"
        >
          <div className="h-px w-8" style={{ background: 'rgba(255,255,255,0.7)' }} />
          <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>Scroll to explore</span>
        </div>
      </section>

      {/* ── Module List — editorial numbered rows ─────────── */}
      <section
        className="relative z-10 overflow-hidden py-28"
        style={{ background: isDark ? '#060810' : '#ffffff' }}
      >
        {/* Background graphics — works light and dark */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Floating hexagon grid */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon fill='none' stroke='${isDark ? '%23ffffff' : '%231f3a8a'}' stroke-width='1' points='30 2 56 16 56 44 30 58 4 44 4 16'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 52px',
            }}
          />
          {/* Radial glow accents */}
          <div
            className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(74,110,232,0.10) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(74,110,232,0.06) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(245,179,0,0.07) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(245,179,0,0.05) 0%, transparent 70%)',
            }}
          />
          {/* Animated floating orbs (subtle) */}
          <div
            className="absolute left-[15%] top-[20%] h-24 w-24 rounded-full"
            style={{
              background: isDark ? 'rgba(74,110,232,0.08)' : 'rgba(74,110,232,0.05)',
              animation: 'float-orb 8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute right-[12%] top-[60%] h-16 w-16 rounded-full"
            style={{
              background: isDark ? 'rgba(245,179,0,0.06)' : 'rgba(245,179,0,0.04)',
              animation: 'float-orb 11s ease-in-out infinite reverse',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 sm:px-10">

          {/* Header */}
          <div className="mb-16 flex items-end justify-between">
            <div>
              <p
                className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em]"
                style={{ color: isDark ? 'rgba(245,179,0,0.7)' : 'rgba(31,58,138,0.6)' }}
              >
                What's Inside
              </p>
              <h2
                className="font-black tracking-tight"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                  lineHeight: 1.05,
                  color: isDark ? '#ffffff' : '#0a1540',
                }}
              >
                Six modules.<br />One campus platform.
              </h2>
            </div>
            <Link
              to={paths.login}
              className="hidden sm:flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: isDark ? 'rgba(245,179,0,0.75)' : 'rgba(31,58,138,0.65)' }}
            >
              Explore all
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Numbered module rows */}
          <div className="flex flex-col">
            {MODULES.map((mod, i) => (
              <div
                key={mod.name}
                className="group flex items-center gap-6 border-t py-7 transition-all duration-200 hover:pl-3 sm:gap-10 sm:py-8"
                style={{
                  borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(31,58,138,0.08)',
                  ...(i === MODULES.length - 1 ? { borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(31,58,138,0.08)'}` } : {}),
                }}
              >
                {/* Number */}
                <span
                  className="font-mono text-sm font-bold tabular-nums"
                  style={{ color: mod.accent, minWidth: '2rem', opacity: 0.8 }}
                >
                  {mod.num}
                </span>

                {/* Icon */}
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `${mod.accent}18` }}
                  aria-hidden="true"
                >
                  {{ '01': '🛒', '02': '🎉', '03': '🏪', '04': '🔍', '05': '🐾', '06': '📢' }[mod.num]}
                </span>

                {/* Name + desc */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-base font-bold sm:text-lg"
                    style={{ color: isDark ? '#ffffff' : '#0a1540' }}
                  >
                    {mod.name}
                  </p>
                  <p
                    className="mt-0.5 text-sm"
                    style={{ color: isDark ? 'rgba(255,255,255,0.58)' : 'rgba(31,58,138,0.65)' }}
                  >
                    {mod.desc}
                  </p>
                </div>

                {/* Arrow — appears on hover */}
                <svg
                  width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke={mod.accent} strokeWidth="2.5" strokeLinecap="round"
                  className="shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="mt-10 sm:hidden text-center">
            <Link
              to={paths.login}
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: isDark ? 'rgba(245,179,0,0.75)' : 'rgba(31,58,138,0.65)' }}
            >
              Sign in to explore all modules →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer
        className="relative z-10 overflow-hidden border-t"
        style={{
          background: isDark ? '#030508' : '#0a1540',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        {/* Footer background graphics */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute -left-32 -top-32 h-64 w-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(74,110,232,0.12) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -right-24 bottom-0 h-48 w-48 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(245,179,0,0.08) 0%, transparent 70%)' }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-14 sm:px-10">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">

            {/* Brand */}
            <div>
              <NUverseMark size={42} className="mb-4" />
              <p className="max-w-[260px] text-sm font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                The official digital campus hub of National University Laguna. Exclusively for the NU Laguna community.
              </p>
              <div className="mt-5 flex gap-3">
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="transition-colors hover:text-white" aria-label={s.label}
                    style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d={s.d} /></svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-16">
              <div>
                <p className="mb-4 text-xs font-black uppercase tracking-[0.22em]" style={{ color: '#ffffff' }}>Platform</p>
                <ul className="space-y-3">
                  {['Marketplace', 'Campus Events', 'Bulldog Exchange', 'Lost & Found', 'Bulldog Chibi'].map((l) => (
                    <li key={l}>
                      <Link to={paths.login}
                        className="text-sm font-medium transition-colors hover:text-white"
                        style={{ color: 'rgba(255,255,255,0.7)' }}>
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-4 text-xs font-black uppercase tracking-[0.22em]" style={{ color: '#ffffff' }}>University</p>
                <ul className="space-y-3">
                  <li>
                    <a href="https://onlineapp.nu-laguna.edu.ph/portal/services.php"
                      target="_blank" rel="noopener noreferrer"
                      className="text-sm font-medium transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.7)' }}>
                      NUIS Portal
                    </a>
                  </li>
                  <li>
                    <a href="https://onlineapp.nu-laguna.edu.ph/quest/home.php"
                      target="_blank" rel="noopener noreferrer"
                      className="text-sm font-medium transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.7)' }}>
                      Admissions
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t px-6 py-5 sm:px-10" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
          <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>© 2026 NUverse Laguna — All Rights Reserved</p>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>Km 53, Pan Philippine Hwy, Calamba City, Laguna 4027</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
